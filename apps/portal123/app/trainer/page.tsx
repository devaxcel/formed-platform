import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import EmptyState from "@/components/portal/ui/EmptyState";
import Link from "next/link";
import {
  ClipboardList, ChevronRight, AlertCircle,
  Calendar, Users, TrendingUp, Clock
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default async function TrainerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, full_name, status, tier, current_client_count, max_active_clients, compliance_flag, payout_rate")
    .eq("user_id", user.id)
    .single();

  if (!trainer) redirect("/auth/login");

  const now      = new Date();
  const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
  const todayEnd   = new Date(now); todayEnd.setHours(23,59,59,999);
  const weekEnd    = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);

  // Today's sessions
  const { data: todaySessions } = await supabase
    .from("sessions")
    .select(`*, clients(full_name, city)`)
    .eq("trainer_id", trainer.id)
    .gte("date_time", todayStart.toISOString())
    .lte("date_time", todayEnd.toISOString())
    .order("date_time", { ascending: true });

  // Upcoming this week
  const { data: upcomingSessions } = await supabase
    .from("sessions")
    .select(`*, clients(full_name)`)
    .eq("trainer_id", trainer.id)
    .gt("date_time", todayEnd.toISOString())
    .lte("date_time", weekEnd.toISOString())
    .in("booking_status", ["admin_confirmed","trainer_accepted","paid"])
    .order("date_time", { ascending: true })
    .limit(5);

  // Pending booking requests
  const { data: pendingRequests } = await supabase
    .from("sessions")
    .select(`*, clients(full_name, city)`)
    .eq("trainer_id", trainer.id)
    .eq("booking_status", "requested")
    .order("created_at", { ascending: true });

  // Sessions missing notes
  const { data: missingSessions } = await supabase
    .from("sessions")
    .select(`*, clients(full_name)`)
    .eq("trainer_id", trainer.id)
    .eq("booking_status", "completed")
    .eq("notes_submitted", false)
    .order("date_time", { ascending: false })
    .limit(5);

  // Monthly stats
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count: monthCompleted } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("trainer_id", trainer.id)
    .eq("booking_status", "completed")
    .gte("date_time", startOfMonth);

  const spotsLeft = (trainer.max_active_clients ?? 10) - (trainer.current_client_count ?? 0);
  const firstName = trainer.full_name?.split(" ")[0] ?? "there";
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-full bg-cream">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="bg-ink px-6 lg:px-8 py-10 lg:py-14">
        <div className="max-w-5xl mx-auto">
          <p className="text-cream/50 text-[10px] tracking-widest uppercase font-body mb-1">
            {greeting}
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-light text-cream mb-6">
            {firstName}.
          </h1>

          {/* Quick stats strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Active Clients",     value: trainer.current_client_count ?? 0,
                sub: spotsLeft > 0 ? `${spotsLeft} spots available` : "At capacity",
                icon: Users },
              { label: "Sessions This Month", value: monthCompleted ?? 0,
                sub: "completed",
                icon: TrendingUp },
              { label: "Today",               value: todaySessions?.length ?? 0,
                sub: todaySessions?.length === 1 ? "session" : "sessions",
                icon: Calendar },
              { label: "Notes Overdue",        value: missingSessions?.length ?? 0,
                sub: missingSessions?.length ? "action needed" : "all clear",
                icon: ClipboardList },
            ].map(({ label, value, sub, icon: Icon }) => (
              <div key={label} className="bg-cream/10 border border-cream/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} className="text-cream/40" />
                  <p className="text-[10px] tracking-widest uppercase text-cream/50 font-body">
                    {label}
                  </p>
                </div>
                <p className="font-display text-3xl font-light text-cream">{value}</p>
                <p className="text-cream/40 text-xs font-body mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ALERTS ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8">

        {/* Compliance alert */}
        {trainer.compliance_flag && (
          <div className="mt-5 bg-red-50 border border-red-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-body font-medium text-red-800">
                  Compliance action required
                </p>
                <p className="text-xs text-red-600 font-body mt-0.5">
                  A certification or document may have expired. Update now to stay active.
                </p>
              </div>
            </div>
            <Link
              href="/trainer/profile"
              className="flex-shrink-0 bg-red-600 text-white text-[10px] tracking-widest uppercase font-body px-5 py-2.5 hover:bg-red-700 transition-colors"
            >
              Update Documents
            </Link>
          </div>
        )}

        {/* Notes overdue — prominent */}
        {missingSessions && missingSessions.length > 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ClipboardList size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-body font-medium text-amber-800">
                  {missingSessions.length} session {missingSessions.length > 1 ? "notes are" : "note is"} overdue
                </p>
                <p className="text-xs text-amber-700 font-body mt-0.5">
                  Session notes must be submitted within 12 hours.
                  {missingSessions[0] && (
                    <> Latest: {missingSessions[0].clients?.full_name} — {formatDate(missingSessions[0].date_time)}</>
                  )}
                </p>
              </div>
            </div>
            <Link
              href="/trainer/notes"
              className="flex-shrink-0 bg-amber-600 text-white text-[10px] tracking-widest uppercase font-body px-5 py-2.5 hover:bg-amber-700 transition-colors"
            >
              Submit Notes Now
            </Link>
          </div>
        )}

        {/* Pending requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-body font-medium text-blue-800">
                {pendingRequests.length} booking request{pendingRequests.length > 1 ? "s" : ""} awaiting your response
              </p>
              <p className="text-xs text-blue-600 font-body mt-0.5">
                Respond promptly to keep clients satisfied.
              </p>
            </div>
            <Link
              href="/trainer/schedule"
              className="flex-shrink-0 bg-blue-600 text-white text-[10px] tracking-widest uppercase font-body px-5 py-2.5 hover:bg-blue-700 transition-colors"
            >
              Review Requests <ChevronRight size={12} className="inline ml-1" />
            </Link>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Today + This Week */}
          <div className="lg:col-span-2 space-y-6">

            {/* Today */}
            <div>
              <SectionHeader
                title="Today"
                action={
                  <Link href="/trainer/schedule"
                    className="text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body flex items-center gap-1">
                    Full Schedule <ChevronRight size={10} />
                  </Link>
                }
              />
              {todaySessions && todaySessions.length > 0 ? (
                <div className="space-y-2">
                  {todaySessions.map((s) => (
                    <Link key={s.id} href={`/trainer/schedule`}>
                      <Card padding="sm" className="hover:border-warm transition-colors cursor-pointer">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-cream w-10 h-10 flex flex-col items-center justify-center border border-stone flex-shrink-0">
                              <span className="text-[9px] font-body text-muted">
                                {new Date(s.date_time).getHours() >= 12 ? "PM" : "AM"}
                              </span>
                              <span className="font-display text-sm font-light text-ink leading-none">
                                {new Date(s.date_time).getHours() % 12 || 12}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-body font-medium text-ink">
                                {s.clients?.full_name}
                              </p>
                              <p className="text-xs text-muted font-body">
                                {formatTime(s.date_time)} · {s.clients?.city} ·{" "}
                                <span className="capitalize">{s.session_type?.replace(/_/g, " ")}</span>
                              </p>
                            </div>
                          </div>
                          <Badge status={s.booking_status} />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card padding="sm">
                  <div className="flex items-center justify-between gap-4 py-2">
                    <p className="text-muted text-sm font-body">No sessions today.</p>
                    <Link
                      href="/trainer/availability"
                      className="text-[10px] tracking-widest uppercase font-body text-muted hover:text-ink transition-colors"
                    >
                      Update Availability →
                    </Link>
                  </div>
                </Card>
              )}
            </div>

            {/* This Week */}
            <div>
              <SectionHeader title="This Week" />
              {upcomingSessions && upcomingSessions.length > 0 ? (
                <div className="space-y-2">
                  {upcomingSessions.map((s) => (
                    <Link key={s.id} href={`/trainer/schedule`}>
                      <Card padding="sm" className="hover:border-warm transition-colors cursor-pointer">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="text-center w-10">
                              <p className="text-[10px] text-muted font-body uppercase">
                                {new Date(s.date_time).toLocaleDateString("en-US", { weekday: "short" })}
                              </p>
                              <p className="font-display text-xl font-light text-ink leading-none">
                                {new Date(s.date_time).getDate()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-body font-medium text-ink">
                                {s.clients?.full_name}
                              </p>
                              <p className="text-xs text-muted font-body">{formatTime(s.date_time)}</p>
                            </div>
                          </div>
                          <Badge status={s.booking_status} />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card padding="sm">
                  <div className="flex items-center justify-between gap-4 py-2">
                    <p className="text-muted text-sm font-body">No sessions this week.</p>
                    <Link href="/trainer/clients"
                      className="text-[10px] tracking-widest uppercase font-body text-muted hover:text-ink transition-colors">
                      View Clients →
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Right — Pending requests + growth */}
          <div className="space-y-6">

            {/* Client capacity */}
            <Card>
              <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
                Client Capacity
              </p>
              <p className="font-display text-2xl font-light text-ink mb-1">
                {trainer.current_client_count ?? 0}
                <span className="text-muted text-base"> / {trainer.max_active_clients ?? 10}</span>
              </p>
              <div className="h-1.5 bg-stone mb-2">
                <div
                  className="h-1.5 bg-ink transition-all"
                  style={{
                    width: `${Math.min(
                      ((trainer.current_client_count ?? 0) / (trainer.max_active_clients ?? 10)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              {spotsLeft > 0 ? (
                <p className="text-xs text-green-700 font-body">
                  You can take {spotsLeft} more client{spotsLeft > 1 ? "s" : ""}
                </p>
              ) : (
                <p className="text-xs text-muted font-body">You're at full capacity</p>
              )}
            </Card>

            {/* Pending booking requests */}
            <div>
              <SectionHeader title="Booking Requests" />
              {pendingRequests && pendingRequests.length > 0 ? (
                <div className="space-y-2">
                  {pendingRequests.slice(0, 3).map((s) => (
                    <Card key={s.id} padding="sm">
                      <p className="text-sm font-body font-medium text-ink mb-1">
                        {s.clients?.full_name}
                      </p>
                      <p className="text-xs text-muted font-body mb-3">
                        {formatDate(s.date_time)} at {formatTime(s.date_time)}
                      </p>
                      <AcceptDeclineInline sessionId={s.id} />
                    </Card>
                  ))}
                </div>
              ) : (
                <Card padding="sm">
                  <p className="text-center text-muted text-sm font-body py-3">
                    No pending requests.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AcceptDeclineInline({ sessionId }: { sessionId: string }) {
  return (
    <div className="flex gap-2">
      <Link href={`/trainer/schedule?action=accept&id=${sessionId}`}
        className="flex-1 text-center text-[10px] tracking-widest uppercase font-body bg-ink text-cream py-2 hover:bg-accent transition-colors">
        Accept
      </Link>
      <Link href={`/trainer/schedule?action=decline&id=${sessionId}`}
        className="flex-1 text-center text-[10px] tracking-widest uppercase font-body bg-stone text-muted py-2 hover:bg-warm transition-colors">
        Decline
      </Link>
    </div>
  );
}