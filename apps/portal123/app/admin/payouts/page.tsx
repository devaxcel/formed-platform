import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import StatCard from "@/components/portal/ui/StatCard";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import PayoutActions from "@/components/admin/PayoutActions";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function AdminPayoutsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: payouts } = await supabase
    .from("payouts")
    .select(`*, trainers(full_name), clients(full_name), sessions(date_time, session_type)`)
    .order("created_at", { ascending: false });

  const totalRequested = payouts?.filter(p => p.status === "requested").reduce((s, p) => s + p.amount, 0) ?? 0;
  const totalApproved  = payouts?.filter(p => p.status === "approved").reduce((s, p) => s + p.amount, 0) ?? 0;
  const totalPaid      = payouts?.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0) ?? 0;
  const pendingCount   = payouts?.filter(p => p.status === "requested").length ?? 0;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <SectionHeader
        title="Payout Management"
        subtitle={`${pendingCount} payout${pendingCount !== 1 ? "s" : ""} awaiting approval`}
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Requested"  value={formatCurrency(totalRequested)} sub="awaiting approval" accent />
        <StatCard label="Approved"   value={formatCurrency(totalApproved)}  sub="awaiting payment" />
        <StatCard label="Paid Out"   value={formatCurrency(totalPaid)}      sub="all time" />
      </div>

      {/* Pending payouts */}
      {pendingCount > 0 && (
        <div>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-3 font-body">
  Requested — Awaiting Approval ({payouts?.filter(p => p.status === "requested").length ?? 0})
</p>
          <div className="space-y-2">
            {payouts?.filter(p => p.status === "requested").map((p) => (
              <Card key={p.id} className="border-l-2 border-l-yellow-400">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-body font-medium text-ink text-sm">
                      {p.trainers?.full_name} — {formatCurrency(p.amount)}
                    </p>
                    <p className="text-muted text-xs font-body">
                      Client: {p.clients?.full_name} ·{" "}
                      {p.sessions?.session_type?.replace(/_/g, " ")} ·{" "}
                      {formatDate(p.sessions?.date_time)}
                    </p>
                  </div>
                  <PayoutActions payoutId={p.id} currentStatus={p.status} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All payouts */}
      <div>
        <SectionHeader title="All Payouts" />
        <div className="space-y-2">
          {payouts?.map((p) => (
            <Card key={p.id} padding="sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-body font-medium text-ink text-sm">
                    {p.trainers?.full_name} — {formatCurrency(p.amount)}
                  </p>
                  <p className="text-muted text-xs font-body">
                    {p.clients?.full_name} · {formatDate(p.created_at)}
                  </p>
                </div>
                <Badge status={p.status} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}