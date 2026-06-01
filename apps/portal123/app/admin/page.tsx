import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/portal/ui/Card";
import StatCard from "@/components/portal/ui/StatCard";
import Badge from "@/components/portal/ui/Badge";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { ChevronRight, AlertCircle } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now           = new Date();
  const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfWeek   = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
  const todayStart    = new Date(now); todayStart.setHours(0,0,0,0);
  const todayEnd      = new Date(now); todayEnd.setHours(23,59,59,999);
  const in30Days      = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // KPIs
  const [
    { count: activeClients },
    { count: activeTrainers },
    { count: newAppsThisWeek },
    { count: unmatchedClients },
    { count: failedPayments },
    { count: openTickets },
    { count: expiringCerts },
    { count: sessionsThisWeek },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("trainers").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("clients").select("*", { count: "exact", head: true }).gte("created_at", startOfWeek.toISOString()),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "ready_for_match"),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "failed"),
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("compliance").select("*", { count: "exact", head: true }).lte("expiry_date", in30Days).gt("expiry_date", now.toISOString()),
    supabase.from("sessions").select("*", { count: "exact", head: true }).gte("date_time", startOfWeek.toISOString()).lte("date_time", now.toISOString()),
  ]);

  // MRR
  const { data: activeSubs } = await supabase
    .from("clients")
    .select("monthly_rate")
    .eq("status", "active");
  const mrr = activeSubs?.reduce((s, c) => s + (c.monthly_rate ?? 0), 0) ?? 0;

  // Today's sessions
  const { data: todaySessions } = await supabase
    .from("sessions")
    .select(`*, clients(full_name), trainers(full_name)`)
    .gte("date_time", todayStart.toISOString())
    .lte("date_time", todayEnd.toISOString())
    .order("date_time", { ascending: true })
    .limit(5);

  // Pending booking requests
  const { data: pendingBookings } = await supabase
    .from("sessions")
    .select(`*, clients(full_name), trainers(full_name)`)
    .eq("booking_status", "requested")
    .order("created_at", { ascending: true })
    .limit(5);

  // Clients awaiting match
  const { data: awaitingMatch } = await supabase
    .from("clients")
    .select("id, full_name, city, plan_type, created_at")
    .eq("status", "ready_for_match")
    .order("created_at", { ascending: true })
    .limit(5);

  // Missing notes
  const { data: missingNotes } = await supabase
    .from("sessions")
    .select(`*, clients(full_name), trainers(full_name)`)
    .eq("booking_status", "completed")
    .eq("notes_submitted", false)
    .order("date_time", { ascending: false })
    .limit(5);

  // New applications
  const { data: newClients } = await supabase
    .from("clients")
    .select("id, full_name, city, created_at, status")
    .eq("status", "submitted")
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: newTrainers } = await supabase
    .from("trainers")
    .select("id, full_name, city, created_at, status")
    .eq("status", "submitted")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {/* Alert bar */}
      {(failedPayments! > 0 || unmatchedClients! > 0 || expiringCerts! > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {failedPayments! > 0 && (
            <Link href="/admin/billing" className="bg-red-50 border border-red-200 p-4 flex items-center gap-3 hover:border-red-300 transition-colors">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-body font-medium text-red-800">{failedPayments} failed payment{failedPayments! > 1 ? "s" : ""}</p>
                <p className="text-[10px] text-red-600 font-body">Requires attention</p>
              </div>
            </Link>
          )}
          {unmatchedClients! > 0 && (
            <Link href="/admin/matching" className="bg-yellow-50 border border-yellow-200 p-4 flex items-center gap-3 hover:border-yellow-300 transition-colors">
              <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-body font-medium text-yellow-800">{unmatchedClients} client{unmatchedClients! > 1 ? "s" : ""} awaiting match</p>
                <p className="text-[10px] text-yellow-600 font-body">Open matching center</p>
              </div>
            </Link>
          )}
          {expiringCerts! > 0 && (
            <Link href="/admin/compliance" className="bg-orange-50 border border-orange-200 p-4 flex items-center gap-3 hover:border-orange-300 transition-colors">
              <AlertCircle size={16} className="text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-body font-medium text-orange-800">{expiringCerts} cert{expiringCerts! > 1 ? "s" : ""} expiring soon</p>
                <p className="text-[10px] text-orange-600 font-body">Review compliance</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* KPI Grid */}
      
<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
  <Link href="/admin/clients"><StatCard label="Active Clients"  value={activeClients ?? 0}   sub="members"       accent /></Link>
  <Link href="/admin/trainers"><StatCard label="Active Trainers" value={activeTrainers ?? 0}  sub="on platform" /></Link>
  <Link href="/admin/billing"><StatCard label="MRR"              value={formatCurrency(mrr)}  sub="monthly recurring" /></Link>
  <Link href="/admin/applications/clients"><StatCard label="New Apps" value={newAppsThisWeek ?? 0} sub="this week" /></Link>
  <Link href="/admin/matching"><StatCard label="Unmatched"       value={unmatchedClients ?? 0} sub="awaiting match" /></Link>
  <Link href="/admin/billing"><StatCard label="Failed Payments"  value={failedPayments ?? 0}  sub="need action" /></Link>
  <Link href="/admin/tickets"><StatCard label="Open Tickets"     value={openTickets ?? 0}     sub="support" /></Link>
  <Link href="/admin/sessions"><StatCard label="Sessions"        value={sessionsThisWeek ?? 0} sub="this week" /></Link>
</div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col — today + pending */}
        <div className="lg:col-span-2 space-y-6">

          {/* Today's sessions */}
          <div>
            <SectionHeader
              title="Today's Sessions"
              action={
                <Link href="/admin/calendar"
                  className="text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body flex items-center gap-1">
                  Calendar <ChevronRight size={10} />
                </Link>
              }
            />
            {todaySessions && todaySessions.length > 0 ? (
              <div className="space-y-2">
                {todaySessions.map((s) => (
                  <Card key={s.id} padding="sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-cream w-9 h-9 flex flex-col items-center justify-center border border-stone flex-shrink-0">
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
                            {formatTime(s.date_time)} · {s.trainers?.full_name}
                          </p>
                        </div>
                      </div>
                      <Badge status={s.booking_status} />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card padding="sm">
                <p className="text-center text-muted text-sm font-body py-4">No sessions today.</p>
              </Card>
            )}
          </div>

          {/* Pending booking requests */}
          {pendingBookings && pendingBookings.length > 0 && (
            <div>
              <SectionHeader
                title="Pending Booking Requests"
                action={
                  <Link href="/admin/sessions"
                    className="text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body flex items-center gap-1">
                    View all <ChevronRight size={10} />
                  </Link>
                }
              />
              <div className="space-y-2">
                {pendingBookings.map((s) => (
                  <Card key={s.id} padding="sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-body font-medium text-ink">{s.clients?.full_name}</p>
                        <p className="text-xs text-muted font-body">
                          {formatDate(s.date_time)} · {s.trainers?.full_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge status={s.booking_status} />
                        <Link href={`/admin/sessions/${s.id}`}
                          className="text-[10px] tracking-widest uppercase font-body bg-ink text-cream px-3 py-1.5 hover:bg-accent transition-colors">
                          Review
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Missing notes */}
          {missingNotes && missingNotes.length > 0 && (
  <div>
    <SectionHeader title="Missing Session Notes" />
    <div className="space-y-2">
      {missingNotes.map((s) => (
        <Card key={s.id} padding="sm" className="border-l-2 border-l-red-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-body font-medium text-ink">
                {s.clients?.full_name}
              </p>
              <p className="text-xs text-muted font-body">
                {formatDate(s.date_time)} · Trainer: {s.trainers?.full_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widests uppercase font-body text-red-500 bg-red-50 px-2 py-1">
                Overdue
              </span>
              <Link
                href={`/admin/sessions/${s.id}`}
                className="text-[10px] tracking-widests uppercase font-body text-muted hover:text-ink transition-colors"
              >
                View Session →
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
          )}
        </div>

        {/* Right col */}
        <div className="space-y-6">

          {/* Awaiting match */}
          <div>
            <SectionHeader
              title="Awaiting Match"
              action={
                <Link href="/admin/matching"
                  className="text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body flex items-center gap-1">
                  Match <ChevronRight size={10} />
                </Link>
              }
            />
            {awaitingMatch && awaitingMatch.length > 0 ? (
              <div className="space-y-2">
                {awaitingMatch.map((c) => (
                  <Card key={c.id} padding="sm">
                    <p className="text-sm font-body font-medium text-ink">{c.full_name}</p>
                    <p className="text-xs text-muted font-body">{c.city} · {c.plan_type?.replace("_", " ")}</p>
                    <Link href={`/admin/matching?client=${c.id}`}
                      className="text-[10px] tracking-widest uppercase font-body text-ink mt-2 block hover:text-muted transition-colors">
                      Match now &rarr;
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card padding="sm">
                <p className="text-center text-muted text-sm font-body py-3">All clients matched.</p>
              </Card>
            )}
          </div>

          {/* New applications */}
          <div>
            <SectionHeader
              title="New Applications"
              action={
                <Link href="/admin/applications/clients"
                  className="text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body flex items-center gap-1">
                  View all <ChevronRight size={10} />
                </Link>
              }
            />
            <div className="space-y-2">
              {newClients?.map((c) => (
                <Link key={c.id} href={`/admin/applications/clients/${c.id}`}>
                  <Card padding="sm" className="hover:border-warm transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-body font-medium text-ink">{c.full_name}</p>
                        <p className="text-[10px] text-muted font-body">{c.city}</p>
                      </div>
                      <Badge status={c.status} />
                    </div>
                  </Card>
                </Link>
              ))}
              {newTrainers?.map((t) => (
                <Link key={t.id} href={`/admin/applications/trainers/${t.id}`}>
                  <Card padding="sm" className="hover:border-warm transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-body font-medium text-ink">{t.full_name}</p>
                        <p className="text-[10px] text-muted font-body">Trainer · {t.city}</p>
                      </div>
                      <Badge status={t.status} />
                    </div>
                  </Card>
                </Link>
              ))}
              {!newClients?.length && !newTrainers?.length && (
                <Card padding="sm">
                  <p className="text-center text-muted text-sm font-body py-3">No new applications.</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}