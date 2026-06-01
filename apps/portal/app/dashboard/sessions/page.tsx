import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import EmptyState from "@/components/portal/ui/EmptyState";
import Link from "next/link";
import { Calendar, ChevronRight, Star } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

function SessionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    paid:             { label: "Confirmed",    className: "bg-green-100 text-green-700" },
    admin_confirmed:  { label: "Confirmed",    className: "bg-green-100 text-green-700" },
    trainer_accepted: { label: "Upcoming",     className: "bg-blue-100 text-blue-700" },
    payment_pending:  { label: "Payment Due",  className: "bg-yellow-100 text-yellow-700" },
    requested:        { label: "Requested",    className: "bg-blue-50 text-blue-600" },
    completed:        { label: "Completed",    className: "bg-stone text-muted" },
    cancelled:        { label: "Cancelled",    className: "bg-red-50 text-red-500" },
    no_show:          { label: "No Show",      className: "bg-red-100 text-red-700" },
  };
  const entry = map[status] ?? { label: status.replace(/_/g, " "), className: "bg-stone text-muted" };
  return (
    <span className={`text-[10px] tracking-widests uppercase font-body px-2.5 py-1 ${entry.className}`}>
      {entry.label}
    </span>
  );
}

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const now = new Date().toISOString();

  const { data: upcoming } = await supabase
    .from("sessions")
    .select(`*, trainers(full_name)`)
    .eq("client_id", client?.id ?? "")
    .gte("date_time", now)
    .order("date_time", { ascending: true });

  const { data: past } = await supabase
    .from("sessions")
    .select(`*, trainers(full_name), session_notes(*)`)
    .eq("client_id", client?.id ?? "")
    .lt("date_time", now)
    .order("date_time", { ascending: false })
    .limit(5);

  const { count: totalPast } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("client_id", client?.id ?? "")
    .lt("date_time", now);

  const nextSession = upcoming?.[0];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-10">

      {/* Next Session hero */}
      {nextSession && (
        <div className="bg-ink p-8">
          <p className="text-[10px] tracking-widests uppercase text-warm/50 mb-3 font-body">
            Next Session
          </p>
          <p className="font-display text-3xl font-light text-cream mb-1">
            {formatDate(nextSession.date_time)}
          </p>
          <p className="text-cream/60 text-sm font-body mb-5">
            {formatTime(nextSession.date_time)} · with {nextSession.trainers?.full_name} ·{" "}
            <span className="capitalize">{nextSession.session_type?.replace(/_/g, " ")}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <SessionStatusBadge status={nextSession.booking_status} />
            <Link
              href="/dashboard/support"
              className="text-[10px] tracking-widests uppercase font-body text-cream/50 hover:text-cream transition-colors"
            >
              Reschedule
            </Link>
            <Link
              href="/dashboard/support"
              className="text-[10px] tracking-widests uppercase font-body text-cream/50 hover:text-cream transition-colors"
            >
              Cancel
            </Link>
            {nextSession.booking_status === "payment_pending" && (
              <Link
                href="/dashboard/billing"
                className="text-[10px] tracking-widests uppercase font-body bg-warm text-ink px-4 py-1.5 hover:bg-stone transition-colors"
              >
                Pay Now
              </Link>
            )}
          </div>
        </div>
      )}

      {/* All upcoming */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-light text-ink">Upcoming</h2>
          <Link
            href="/dashboard/book"
            className="inline-flex items-center gap-2 bg-ink text-cream text-[10px] tracking-widests uppercase font-body px-5 py-2.5 hover:bg-accent transition-colors"
          >
            <Calendar size={12} /> Request a Session
          </Link>
        </div>

        {upcoming && upcoming.length > 0 ? (
          <div className="space-y-2">
            {upcoming.map((s, i) => (
              <Card key={s.id} padding="sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-cream w-12 h-12 flex flex-col items-center justify-center border border-stone flex-shrink-0">
                      <span className="text-[10px] font-body text-muted uppercase">
                        {new Date(s.date_time).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="font-display text-xl font-light text-ink leading-none">
                        {new Date(s.date_time).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-body font-medium text-ink text-sm">
                        {formatTime(s.date_time)}
                      </p>
                      <p className="text-muted text-xs font-body">
                        {s.trainers?.full_name} ·{" "}
                        <span className="capitalize">{s.session_type?.replace(/_/g, " ")}</span>
                        {" "}· {s.duration_minutes ?? 60} min
                      </p>
                      <p className="text-[10px] text-muted font-body mt-0.5">
                        Included in your plan
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <SessionStatusBadge status={s.booking_status} />
                    {i > 0 && (
                      <div className="flex gap-3">
                        <Link href="/dashboard/support"
                          className="text-[10px] tracking-widests uppercase font-body text-muted hover:text-ink transition-colors">
                          Reschedule
                        </Link>
                        <Link href="/dashboard/support"
                          className="text-[10px] tracking-widests uppercase font-body text-muted hover:text-red-600 transition-colors">
                          Cancel
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<Calendar size={24} />}
              title="No upcoming sessions"
              description="Request a session with your trainer to get started."
              action={
                <Link
                  href="/dashboard/book"
                  className="inline-flex items-center gap-2 bg-ink text-cream text-[10px] tracking-widests uppercase font-body px-6 py-3 hover:bg-accent transition-colors"
                >
                  Request a Session
                </Link>
              }
            />
          </Card>
        )}
      </div>

      {/* Session history — minimal with View full history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-light text-ink">History</h2>
          <p className="text-xs text-muted font-body">{totalPast ?? 0} total</p>
        </div>

        {past && past.length > 0 ? (
          <>
            <div className="space-y-2">
              {past.map((s) => (
                <Card key={s.id} padding="sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-10 flex-shrink-0">
                        <p className="text-[10px] text-muted font-body uppercase">
                          {new Date(s.date_time).toLocaleDateString("en-US", { month: "short" })}
                        </p>
                        <p className="font-display text-xl font-light text-ink leading-none">
                          {new Date(s.date_time).getDate()}
                        </p>
                      </div>
                      <div>
                        <p className="font-body text-sm text-ink">{formatTime(s.date_time)}</p>
                        <p className="text-xs text-muted font-body capitalize">
                          {s.session_type?.replace(/_/g, " ")} · {s.trainers?.full_name}
                        </p>
                      </div>
                    </div>
                    <SessionStatusBadge status={s.booking_status} />
                  </div>

                  {/* Session notes preview */}
                  {s.session_notes?.[0] && (
                    <div className="mt-3 pt-3 border-t border-stone grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {s.session_notes[0].wins_improvements && (
                        <div>
                          <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-1">Wins</p>
                          <p className="text-xs text-ink font-body leading-relaxed">
                            {s.session_notes[0].wins_improvements}
                          </p>
                        </div>
                      )}
                      {s.session_notes[0].next_session_focus && (
                        <div>
                          <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-1">Next Focus</p>
                          <p className="text-xs text-ink font-body leading-relaxed">
                            {s.session_notes[0].next_session_focus}
                          </p>
                        </div>
                      )}
                      {s.session_notes[0].homework_habits && (
                        <div>
                          <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-1">Homework</p>
                          <p className="text-xs text-ink font-body leading-relaxed">
                            {s.session_notes[0].homework_habits}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {(totalPast ?? 0) > 5 && (
              <p className="text-center text-[10px] tracking-widests uppercase text-muted font-body mt-4">
                Showing 5 of {totalPast} sessions
              </p>
            )}
          </>
        ) : (
          <Card padding="sm">
            <p className="text-center text-muted text-sm font-body py-4">
              Your completed sessions will appear here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}