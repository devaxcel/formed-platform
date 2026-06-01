import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function AdminTrainersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: trainers } = await supabase
    .from("trainers")
    .select("id, full_name, city, tier, status, current_client_count, max_active_clients, compliance_flag, payout_rate")
    .in("status", ["active", "restricted"])
    .order("current_client_count", { ascending: false });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Active Trainers"
        subtitle={`${trainers?.length ?? 0} trainers`}
      />

      <div className="space-y-2">
        {trainers?.map((t) => (
          <Link key={t.id} href={`/admin/trainers/${t.id}`}>
            <Card className="hover:border-warm transition-colors cursor-pointer">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-stone flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-ink text-base font-light">{t.full_name?.[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-body font-medium text-ink text-sm">{t.full_name}</p>
                      {t.compliance_flag && (
                        <span className="text-[9px] tracking-widest uppercase font-body bg-red-100 text-red-600 px-1.5 py-0.5">
                          Compliance
                        </span>
                      )}
                    </div>
                    <p className="text-muted text-xs font-body">
                      {t.city} · {t.tier?.replace(/_/g, " ")} ·{" "}
                      {t.current_client_count}/{t.max_active_clients} clients ·{" "}
                      ${t.payout_rate}/session
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Capacity bar */}
                  <div className="w-20">
                    <div className="h-1 bg-stone">
                      <div
                        className="h-1 bg-ink"
                        style={{ width: `${Math.min(((t.current_client_count ?? 0) / (t.max_active_clients ?? 10)) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-muted font-body text-right mt-0.5">
                      {Math.round(((t.current_client_count ?? 0) / (t.max_active_clients ?? 10)) * 100)}%
                    </p>
                  </div>
                  <Badge status={t.status} />
                  <ChevronRight size={14} className="text-muted" />
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {(!trainers || trainers.length === 0) && (
          <Card>
            <p className="text-center text-muted text-sm font-body py-8">No active trainers.</p>
          </Card>
        )}
      </div>
    </div>
  );
}