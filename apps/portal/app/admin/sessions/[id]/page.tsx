import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import SessionAdminActions from "@/components/admin/SessionAdminActions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import ChargeSessionButton from "@/components/admin/ChargeSessionButton";

// ✅ Fix: Make params a Promise and await it
export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Unwrap params with await
  const { id: sessionId } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: session } = await supabase
    .from("sessions")
    .select(`
      *,
      clients(id, full_name, city),
      trainers(id, full_name),
      session_notes(*),
      payments(*)
    `)
    .eq("id", sessionId)  // ✅ Use sessionId instead of params.id
    .single();

  if (!session) redirect("/admin/sessions");

  const notes = session.session_notes?.[0];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Link href="/admin/sessions"
        className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body">
        <ArrowLeft size={12} /> Back to sessions
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-light text-ink mb-1">
            {session.clients?.full_name}
          </h1>
          <p className="text-muted text-sm font-body">
            {formatDate(session.date_time)} at {formatTime(session.date_time)} ·{" "}
            Trainer: {session.trainers?.full_name}
          </p>
        </div>
        <Badge status={session.booking_status} />
      </div>

      <SessionAdminActions sessionId={session.id} currentStatus={session.booking_status} />
      <ChargeSessionButton
        sessionId={session.id}
        currentStatus={session.booking_status}
      />
      {/* Session details */}
      <Card>
        <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Session Info</p>
        {[
          { label: "Type",           value: session.session_type?.replace(/_/g, " ") },
          { label: "Duration",       value: `${session.duration_minutes ?? 60} minutes` },
          { label: "Notes submitted", value: session.notes_submitted ? "Yes" : "No" },
          { label: "Payout status",  value: session.payout_status?.replace(/_/g, " ") },
          { label: "Location notes", value: session.location_notes },
        ].map(f => f.value ? (
          <div key={f.label} className="grid grid-cols-2 gap-3 py-2.5 border-b border-stone last:border-0">
            <p className="text-xs text-muted font-body">{f.label}</p>
            <p className="text-xs text-ink font-body capitalize">{f.value}</p>
          </div>
        ) : null)}
      </Card>

      {/* Session notes */}
      {notes ? (
        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Trainer Notes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "Exercises",    value: notes.exercises_completed },
              { label: "RPE",          value: notes.intensity_rpe },
              { label: "Energy level", value: notes.client_energy_level },
              { label: "Wins",         value: notes.wins_improvements },
              { label: "Limitations",  value: notes.limitations_pain },
              { label: "Homework",     value: notes.homework_habits },
              { label: "Next focus",   value: notes.next_session_focus },
            ].map(f => f.value ? (
              <div key={f.label}>
                <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-1">{f.label}</p>
                <p className="text-sm text-ink font-body leading-relaxed">{String(f.value)}</p>
              </div>
            ) : null)}
            {notes.is_late && (
              <div className="sm:col-span-2">
                <span className="text-[10px] tracking-widest uppercase font-body text-red-500 bg-red-50 px-2 py-1">
                  Notes submitted late
                </span>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-muted text-sm font-body text-center py-4">No session notes submitted.</p>
        </Card>
      )}
    </div>
  );
}