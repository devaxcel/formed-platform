// ⚠️ THESE MUST BE AT THE VERY TOP ⚠️
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const STATUS_FILTERS = [
  "all", "submitted", "under_review", "interview_requested",
  "approved_pending_docs", "approved_pending_training", "active", "restricted", "rejected"
];

export default async function TrainerApplicationsPage({
  searchParams
}: { 
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const status = params.status ?? "submitted";

  console.log(`[Server] Fetching trainers with status: ${status}`);

  let query = supabase
    .from("trainers")
    .select("id, full_name, email, city, certifications, specialties, experience_years, status, tier, created_at")
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  const { data: trainers } = await query;

  const { data: counts } = await supabase.from("trainers").select("status");
  const countByStatus = counts?.reduce((acc: Record<string, number>, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <SectionHeader title="Trainer Applications" subtitle={`${trainers?.length ?? 0} trainers`} />

      <div className="flex gap-1 flex-wrap border-b border-stone pb-0 overflow-x-auto">
        {STATUS_FILTERS.map(s => (
          <Link 
            key={s}
            href={`/admin/applications/trainers?status=${s}`}
            className={`px-3 py-2 text-[10px] tracking-widest uppercase font-body transition-colors border-b-2 -mb-px whitespace-nowrap ${
              status === s ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {s.replace(/_/g, " ")}
            {s !== "all" && countByStatus[s] ? (
              <span className="ml-1 text-[9px]">({countByStatus[s]})</span>
            ) : null}
          </Link>
        ))}
      </div>

      {trainers && trainers.length > 0 ? (
        <div className="space-y-2">
          {trainers.map((t) => (
            <Link key={t.id} href={`/admin/applications/trainers/${t.id}`}>
              <Card className="hover:border-warm transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-stone flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-ink text-base font-light">{t.full_name?.[0]}</span>
                    </div>
                    <div>
                      <p className="font-body font-medium text-ink text-sm">{t.full_name}</p>
                      <p className="text-muted text-xs font-body">
                        {t.city} · {t.experience_years}yr exp ·{" "}
                        {t.specialties?.slice(0, 2).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-muted font-body">{formatDate(t.created_at)}</p>
                    <Badge status={t.status} />
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-muted text-sm font-body py-8">
            No {status !== "all" ? status.replace(/_/g, " ") : ""} applications.
          </p>
        </Card>
      )}
    </div>
  );
}