import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: clients } = await supabase
    .from("clients")
    .select(`
      id, full_name, email, city, plan_type, monthly_rate,
      status, billing_status, churn_risk_flag, created_at,
      trainers:assigned_trainer_id(full_name)
    `)
    .in("status", ["active", "on_hold", "billing_issue", "cancel_requested"])
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Active Clients"
        subtitle={`${clients?.length ?? 0} members`}
      />

      <div className="space-y-2">
        {clients?.map((c) => (
          <Link key={c.id} href={`/admin/clients/${c.id}`}>
            <Card className="hover:border-warm transition-colors cursor-pointer">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-stone flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-ink text-base font-light">{c.full_name?.[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-body font-medium text-ink text-sm">{c.full_name}</p>
                      {c.churn_risk_flag && (
                        <span className="text-[9px] tracking-widest uppercase font-body bg-red-100 text-red-600 px-1.5 py-0.5">
                          Churn risk
                        </span>
                      )}
                    </div>
                    <p className="text-muted text-xs font-body">
                      {c.city} · {c.plan_type?.replace("_", " ")} ·{" "}
                      {c.monthly_rate ? formatCurrency(c.monthly_rate) + "/mo" : ""}
                    </p>
                    <p className="text-muted text-xs font-body">
                      Trainer: {c.trainers?.[0]?.full_name ?? "Unassigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={c.status} />
                  <ChevronRight size={14} className="text-muted" />
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {(!clients || clients.length === 0) && (
          <Card>
            <p className="text-center text-muted text-sm font-body py-8">No active clients.</p>
          </Card>
        )}
      </div>
    </div>
  );
}