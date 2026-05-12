import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import StatCard from "@/components/portal/ui/StatCard";
import EmptyState from "@/components/portal/ui/EmptyState";
import { TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients").select("id").eq("user_id", user.id).single();

  const { data: progress } = await supabase
    .from("client_progress")
    .select("*")
    .eq("client_id", client?.id ?? "")
    .order("recorded_at", { ascending: false });

  const { count: totalSessions } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("client_id", client?.id ?? "")
    .eq("booking_status", "completed");

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count: monthSessions } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("client_id", client?.id ?? "")
    .eq("booking_status", "completed")
    .gte("date_time", startOfMonth);

  const latestProgress = progress?.[0];
  const monthlyReviews = progress?.filter(p => p.is_monthly_review) ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Progress Tracking"
        subtitle="Your fitness journey at a glance"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Sessions"  value={totalSessions ?? 0}  sub="completed"    accent />
        <StatCard label="This Month"      value={monthSessions ?? 0}  sub="sessions" />
        <StatCard label="Progress Reviews" value={monthlyReviews.length} sub="monthly reviews" />
        <StatCard
          label="Latest Weight"
          value={latestProgress?.body_weight_kg ? `${latestProgress.body_weight_kg} kg` : "—"}
          sub={latestProgress ? formatDate(latestProgress.recorded_at) : "Not recorded"}
        />
      </div>

      {/* Latest metrics */}
      {latestProgress ? (
        <div>
          <SectionHeader
            title="Latest Measurements"
            subtitle={`Recorded ${formatDate(latestProgress.recorded_at)}`}
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {latestProgress.body_weight_kg && (
              <Card padding="sm">
                <p className="text-[10px] tracking-widest uppercase text-muted mb-1 font-body">Body Weight</p>
                <p className="font-display text-2xl font-light text-ink">{latestProgress.body_weight_kg} <span className="text-sm text-muted">kg</span></p>
              </Card>
            )}
            {latestProgress.body_fat_pct && (
              <Card padding="sm">
                <p className="text-[10px] tracking-widest uppercase text-muted mb-1 font-body">Body Fat</p>
                <p className="font-display text-2xl font-light text-ink">{latestProgress.body_fat_pct}<span className="text-sm text-muted">%</span></p>
              </Card>
            )}
            {latestProgress.consistency_score && (
              <Card padding="sm">
                <p className="text-[10px] tracking-widest uppercase text-muted mb-1 font-body">Consistency Score</p>
                <p className="font-display text-2xl font-light text-ink">{latestProgress.consistency_score}<span className="text-sm text-muted"> / 10</span></p>
              </Card>
            )}
          </div>
        </div>
      ) : null}

      {/* Monthly reviews */}
      <div>
        <SectionHeader title="Monthly Progress Reviews" />
        {monthlyReviews.length > 0 ? (
          <div className="space-y-4">
            {monthlyReviews.map((review) => (
              <Card key={review.id}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-display text-lg font-light text-ink">
                      {new Date(review.recorded_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                    <p className="text-muted text-xs font-body">Monthly review</p>
                  </div>
                  {review.adherence_score && (
                    <div className="text-right">
                      <p className="text-[10px] tracking-widest uppercase text-muted font-body">Adherence</p>
                      <p className="font-display text-xl font-light text-ink">{review.adherence_score}/10</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-stone pt-4">
                  {review.what_improved && (
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted mb-1.5 font-body">What Improved</p>
                      <p className="text-sm text-ink font-body leading-relaxed">{review.what_improved}</p>
                    </div>
                  )}
                  {review.what_stalled && (
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted mb-1.5 font-body">What Stalled</p>
                      <p className="text-sm text-ink font-body leading-relaxed">{review.what_stalled}</p>
                    </div>
                  )}
                  {review.program_adjustments && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] tracking-widest uppercase text-muted mb-1.5 font-body">Programme Adjustments</p>
                      <p className="text-sm text-ink font-body leading-relaxed">{review.program_adjustments}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<TrendingUp size={28} />}
              title="No progress reviews yet"
              description="Your trainer will submit monthly progress reviews after your first 30 days."
            />
          </Card>
        )}
      </div>
    </div>
  );
}