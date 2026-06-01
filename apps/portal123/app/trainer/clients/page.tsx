import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import EmptyState from "@/components/portal/ui/EmptyState";
import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TrainerClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: trainer } = await supabase
    .from("trainers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: clients } = await supabase
    .from("clients")
    .select(`
      id, full_name, status, plan_type, city, created_at,
      sessions(id, date_time, booking_status, notes_submitted)
    `)
    .eq("assigned_trainer_id", trainer?.id ?? "")
    .order("created_at", { ascending: false });

  const active    = clients?.filter(c => c.status === "active") ?? [];
  const nonActive = clients?.filter(c => c.status !== "active") ?? [];

  const getNextSession = (sessions: any[]) => {
    const now = new Date();
    return sessions
      ?.filter(s =>
        new Date(s.date_time) > now &&
        ["admin_confirmed", "trainer_accepted", "paid"].includes(s.booking_status)
      )
      .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())[0];
  };

  const getSessionsNeedingNotes = (sessions: any[]) =>
    sessions?.filter(s => s.booking_status === "completed" && !s.notes_submitted) ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="My Clients"
        subtitle={`${clients?.length ?? 0} assigned client${clients?.length !== 1 ? "s" : ""}`}
      />

      {/* Active clients */}
      {active.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
            Active ({active.length})
          </p>
          <div className="space-y-2">
            {active.map((client) => {
              const next = getNextSession(client.sessions ?? []);
              const needsNotes = getSessionsNeedingNotes(client.sessions ?? []);

              return (
                <div key={client.id} className="bg-white border border-stone hover:border-warm transition-colors">
                  {/* Client header */}
                  <div className="flex items-center justify-between gap-4 p-5 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-ink flex items-center justify-center flex-shrink-0">
                        <span className="font-display text-cream text-lg font-light">
                          {client.full_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-body font-medium text-ink text-sm">
                          {client.full_name}
                        </p>
                        <p className="text-muted text-xs font-body">
                          {client.city} ·{" "}
                          {client.plan_type?.replace("_", " ").replace("week", "/ week")}
                        </p>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {needsNotes.length > 0 && (
                        <Link
                          href={`/trainer/notes/${needsNotes[0].id}`}
                          className="text-[10px] tracking-widest uppercase font-body bg-amber-600 text-white px-3 py-1.5 hover:bg-amber-700 transition-colors"
                        >
                          Add Notes ({needsNotes.length})
                        </Link>
                      )}
                      <Link
                        href="/trainer/schedule"
                        className="text-[10px] tracking-widest uppercase font-body border border-stone text-muted px-3 py-1.5 hover:border-warm hover:text-ink transition-colors"
                      >
                        Schedule
                      </Link>
                      <Link
                        href={`/trainer/clients/${client.id}`}
                        className="text-[10px] tracking-widest uppercase font-body bg-ink text-cream px-3 py-1.5 hover:bg-accent transition-colors flex items-center gap-1"
                      >
                        View Profile <ChevronRight size={10} />
                      </Link>
                    </div>
                  </div>

                  {/* Next session strip */}
                  {next ? (
                    <div className="px-5 py-3 border-t border-stone bg-cream/50 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-0.5">
                          Next Session
                        </p>
                        <p className="text-sm font-body text-ink">
                          {formatDate(next.date_time)}
                        </p>
                      </div>
                      <span className={`text-[10px] tracking-widest uppercase font-body px-2.5 py-1 ${
                        next.booking_status === "paid" || next.booking_status === "admin_confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {next.booking_status === "paid" || next.booking_status === "admin_confirmed"
                          ? "Confirmed"
                          : "Upcoming"}
                      </span>
                    </div>
                  ) : (
                    <div className="px-5 py-3 border-t border-stone bg-cream/30">
                      <p className="text-xs text-muted font-body">No upcoming session scheduled</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Non-active clients */}
      {nonActive.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
            Other ({nonActive.length})
          </p>
          <div className="space-y-2">
            {nonActive.map((client) => (
              <Link key={client.id} href={`/trainer/clients/${client.id}`}>
                <Card className="hover:border-warm transition-colors cursor-pointer opacity-70">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-stone flex items-center justify-center flex-shrink-0">
                        <span className="font-display text-ink text-lg font-light">
                          {client.full_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-body font-medium text-ink text-sm">{client.full_name}</p>
                        <p className="text-muted text-xs font-body capitalize">
                          {client.status?.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!clients || clients.length === 0) && (
        <Card>
          <EmptyState
            icon={<Users size={28} />}
            title="No clients assigned yet"
            description="Complete your onboarding and set your availability to start receiving client assignments."
            action={
              <div className="flex gap-3">
                <Link href="/trainer/onboarding"
                  className="text-[10px] tracking-widest uppercase font-body bg-ink text-cream px-5 py-2.5 hover:bg-accent transition-colors">
                  Complete Onboarding
                </Link>
                <Link href="/trainer/availability"
                  className="text-[10px] tracking-widest uppercase font-body border border-stone text-muted px-5 py-2.5 hover:border-warm hover:text-ink transition-colors">
                  Set Availability
                </Link>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
}