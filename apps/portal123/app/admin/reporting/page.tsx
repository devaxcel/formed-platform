import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import StatCard from "@/components/portal/ui/StatCard";
import Card from "@/components/portal/ui/Card";
import { formatCurrency } from "@/lib/utils";

export default async function ReportingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), start: d.toISOString(), end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString() };
  }).reverse();

  const [
    { count: totalClients },
    { count: totalTrainers },
    { count: totalSessions },
    { count: churnRisk },
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("trainers").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("booking_status", "completed"),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("churn_risk_flag", true),
  ]);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, status, created_at")
    .eq("status", "paid");

  const totalRevenue = payments?.reduce((s, p) => s + p.amount, 0) ?? 0;

  // Monthly revenue breakdown
  const monthlyRevenue = months.map(m => {
    const total = payments
      ?.filter(p => p.created_at >= m.start && p.created_at <= m.end)
      .reduce((s, p) => s + p.amount, 0) ?? 0;
    return { ...m, total };
  });

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.total), 1);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <SectionHeader title="Reporting" subtitle="Platform health at a glance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Clients"   value={totalClients ?? 0}          sub="all time"  accent />
        <StatCard label="Active Trainers" value={totalTrainers ?? 0}         sub="on platform" />
        <StatCard label="Total Sessions"  value={totalSessions ?? 0}         sub="completed" />
        <StatCard label="Total Revenue"   value={formatCurrency(totalRevenue)} sub="all time" />
      </div>

      {/* Revenue chart */}
      <Card>
        <p className="text-[10px] tracking-widests uppercase text-muted mb-6 font-body">
          Monthly Revenue (last 6 months)
        </p>
        <div className="flex items-end gap-3 h-32">
          {monthlyRevenue.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
              <p className="text-[10px] font-body text-muted">{formatCurrency(m.total)}</p>
              <div className="w-full bg-stone relative">
                <div
                  className="bg-ink transition-all duration-500"
                  style={{ height: `${Math.max((m.total / maxRevenue) * 80, 4)}px` }}
                />
              </div>
              <p className="text-[10px] font-body text-muted">{m.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Churn risk */}
      <Card>
        <p className="text-[10px] tracking-widests uppercase text-muted mb-3 font-body">Churn Risk</p>
        <p className="font-display text-4xl font-light text-ink">{churnRisk ?? 0}</p>
        <p className="text-muted text-xs font-body mt-1">
          clients flagged as churn risk — review their accounts in Active Clients.
        </p>
      </Card>
    </div>
  );
}