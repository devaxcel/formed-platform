import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function AdminSessionsPage({
  searchParams
}: { searchParams: Promise<{ status?: string }> }) {
  const { status: statusParam } = await searchParams;
  const status = statusParam ?? "requested";
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const FILTERS = [
    "requested", "trainer_accepted", "admin_confirmed",
    "payment_pending", "paid", "completed", "cancelled", "no_show"
  ];

  // Query with proper relations
  let query = supabase
    .from("sessions")
    .select(`
      id, 
      date_time, 
      booking_status, 
      session_type,
      notes_submitted, 
      payout_status,
      client_id,
      trainer_id,
      client:clients!client_id (
        full_name
      ),
      trainer:trainers!trainer_id (
        full_name
      )
    `)
    .order("date_time", { ascending: false })
    .limit(50);

  if (status !== "all") query = query.eq("booking_status", status);

  const { data: sessions, error: queryError } = await query;

  // Prepare debug information - FIXED VERSION
  const debugInfo: any = {
    status,
    hasError: !!queryError,
    errorMessage: queryError?.message,
    sessionsCount: sessions?.length || 0,
    firstSessionRaw: sessions && sessions.length > 0 ? sessions[0] : null,
    sessionIds: sessions?.map(s => s.id).slice(0, 5),
  };

  // Separate query to check if sessions exist at all - FIXED
  try {
    const { count, error: countError } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true });
    
    debugInfo.totalSessionsCount = count;
    debugInfo.countError = countError?.message;
  } catch (err: any) {
    debugInfo.countError = err.message;
  }

  // Also check if there are any sessions with the current status
  try {
    const { count: statusCount } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("booking_status", status !== "all" ? status : "requested");
    
    debugInfo.statusSessionsCount = statusCount;
  } catch (err: any) {
    debugInfo.statusCountError = err.message;
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* VISIBLE DEBUG SECTION */}
      {/* <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-md mb-4">
        <details open>
          <summary className="font-bold cursor-pointer">🔍 DEBUG INFO (Click to collapse)</summary>
          <pre className="text-xs mt-2 overflow-auto max-h-96 whitespace-pre-wrap bg-white p-2 rounded border">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div> */}

      <SectionHeader title="Session Management" />

      <div className="flex gap-1 flex-wrap border-b border-stone pb-0 overflow-x-auto">
        {["all", ...FILTERS].map(s => (
          <Link
            key={s}
            href={`/admin/sessions?status=${s}`}
            className={`px-3 py-2 text-[10px] tracking-widest uppercase font-body transition-colors border-b-2 -mb-px whitespace-nowrap ${
              status === s ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {sessions && sessions.length > 0 ? (
          sessions.map((s: any) => {
            // Extract names safely
            let clientName = "Unknown Client";
            let trainerName = "Unknown Trainer";
            
            if (s.client) {
              if (Array.isArray(s.client) && s.client.length > 0) {
                clientName = s.client[0]?.full_name || "Unknown Client";
              } else if (s.client.full_name) {
                clientName = s.client.full_name;
              }
            }
            
            if (s.trainer) {
              if (Array.isArray(s.trainer) && s.trainer.length > 0) {
                trainerName = s.trainer[0]?.full_name || "Unknown Trainer";
              } else if (s.trainer.full_name) {
                trainerName = s.trainer.full_name;
              }
            }
            
            return (
              <Link key={s.id} href={`/admin/sessions/${s.id}`}>
                <Card className="hover:border-warm transition-colors cursor-pointer">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="bg-cream w-10 h-10 flex flex-col items-center justify-center border border-stone flex-shrink-0">
                        <span className="text-[9px] font-body text-muted uppercase">
                          {new Date(s.date_time).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="font-display text-lg font-light text-ink leading-none">
                          {new Date(s.date_time).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="font-body font-medium text-ink text-sm">
                          {clientName} → {trainerName}
                        </p>
                        <p className="text-muted text-xs font-body">
                          {formatTime(s.date_time)} · {s.session_type?.replace(/_/g, " ")}
                        </p>
                        {/* <p className="text-[9px] text-muted font-mono">
                          Client ID: {s.client_id?.slice(0, 8)}... | Trainer ID: {s.trainer_id?.slice(0, 8)}...
                        </p> */}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!s.notes_submitted && s.booking_status === "completed" && (
                        <span className="text-[10px] tracking-widest uppercase font-body text-red-500 bg-red-50 px-2 py-1">
                          Notes missing
                        </span>
                      )}
                      <Badge status={s.booking_status} />
                      <ChevronRight size={14} className="text-muted" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        ) : (
          <Card>
            <p className="text-center text-muted text-sm font-body py-8">
              No {status !== "all" ? status.replace(/_/g, " ") : ""} sessions found.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
