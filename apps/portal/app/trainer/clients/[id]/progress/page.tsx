import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import TrainerProgressActions from "@/components/trainer/TrainerProgressActions";

export default async function ClientProgressPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients").select("id, full_name, plan_type, city").eq("id", params.id).single();
  if (!client) redirect("/trainer/clients");

  const { data: photos } = await supabase
    .from("progress_photos").select("*").eq("client_id", params.id)
    .order("recorded_at", { ascending: false });

  const { data: progress } = await supabase
    .from("client_progress").select("*").eq("client_id", params.id)
    .order("recorded_at", { ascending: false });

  const { count: totalSessions } = await supabase
    .from("sessions").select("*", { count: "exact", head: true })
    .eq("client_id", params.id).eq("booking_status", "completed");

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count: monthSessions } = await supabase
    .from("sessions").select("*", { count: "exact", head: true })
    .eq("client_id", params.id).eq("booking_status", "completed").gte("date_time", startOfMonth);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <Link href={`/trainer/clients/${params.id}`}
        className="inline-flex items-center gap-2 text-[10px] tracking-widests uppercase text-muted hover:text-ink font-body transition-colors">
        <ArrowLeft size={12} /> Back to Client
      </Link>

      {/* Header */}
      <div className="bg-ink p-8">
        <p className="text-[10px] tracking-widests uppercase text-warm/40 mb-2 font-body">Progress Review</p>
        <h1 className="font-display text-3xl font-light text-cream mb-1">{client.full_name}</h1>
        <p className="text-cream/60 text-sm font-body">{client.city} · {client.plan_type?.replace("_"," ").replace("week","/ week")}</p>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Sessions", value: totalSessions ?? 0 },
            { label: "This Month", value: monthSessions ?? 0 },
            { label: "Check-Ins", value: photos?.length ?? 0 },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-cream/40 text-[10px] font-body mb-0.5">{label}</p>
              <p className="font-display text-2xl font-light text-cream">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Monthly Assessment */}
      <TrainerProgressActions clientId={params.id} />

      {/* Photo timeline */}
      {photos && photos.length > 0 ? (
        <div>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">Photo Timeline</p>
          <div className="space-y-6">
            {photos.map((photo: any, idx: number) => (
              <div key={photo.id} className="bg-white border border-stone">
                <div className="flex items-center justify-between gap-4 p-5 border-b border-stone">
                  <div>
                    <p className="font-display text-lg font-light text-ink">
                      {new Date(photo.recorded_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-[10px] tracking-widests uppercase text-muted font-body">
                      {photo.is_baseline ? "Baseline" : `Check-In #${idx}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted font-body">
                    {photo.weight_lbs && <span><strong className="text-ink">{photo.weight_lbs} lbs</strong> weight</span>}
                    {photo.energy_level && <span><strong className="text-ink">{photo.energy_level}/5</strong> energy</span>}
                    {photo.sleep_quality && <span><strong className="text-ink">{photo.sleep_quality}/5</strong> sleep</span>}
                  </div>
                </div>

                {/* Photos */}
                <div className="grid grid-cols-3 gap-px bg-stone">
                  {[["front_url","Front"],["side_url","Side"],["back_url","Back"]].map(([key, label]) => (
                    <div key={key} className="bg-white aspect-[3/4] relative overflow-hidden">
                      {photo[key] ? (
                        <img src={photo[key]} alt={label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-cream flex items-center justify-center">
                          <p className="text-[10px] text-muted font-body">{label}</p>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[9px] tracking-widests uppercase font-body px-1.5 py-0.5">{label}</span>
                    </div>
                  ))}
                </div>

                {(photo.wins || photo.challenges) && (
                  <div className="px-5 py-4 grid grid-cols-2 gap-4 border-t border-stone">
                    {photo.wins && <div>
                      <p className="text-[10px] tracking-widests uppercase text-muted mb-1 font-body">Client Wins</p>
                      <p className="text-sm text-ink font-body leading-relaxed">{photo.wins}</p>
                    </div>}
                    {photo.challenges && <div>
                      <p className="text-[10px] tracking-widests uppercase text-muted mb-1 font-body">Challenges</p>
                      <p className="text-sm text-ink font-body leading-relaxed">{photo.challenges}</p>
                    </div>}
                  </div>
                )}

                {/* Trainer comment section */}
                <div className="px-5 pb-5 border-t border-stone pt-4">
                  {photo.trainer_comment ? (
                    <div>
                      <p className="text-[10px] tracking-widests uppercase text-muted mb-2 font-body">Your Comment</p>
                      <p className="text-sm text-ink font-body leading-relaxed italic bg-ink/5 border-l-2 border-ink px-4 py-3">{photo.trainer_comment}</p>
                    </div>
                  ) : (
                    <AddTrainerComment photoId={photo.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <p className="text-center text-muted text-sm font-body py-8">
            No progress photos yet. Client hasn't uploaded their baseline check-in.
          </p>
        </Card>
      )}

      {/* Progress reviews */}
      {progress && progress.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">Monthly Assessments</p>
          <div className="space-y-4">
            {progress.filter((p: any) => p.is_monthly_review).map((r: any) => (
              <div key={r.id} className="bg-white border border-stone p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <p className="font-display text-lg font-light text-ink">
                    {new Date(r.recorded_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                  {r.adherence_score && (
                    <div className="text-right">
                      <p className="text-[10px] tracking-widests uppercase text-muted font-body">Adherence</p>
                      <p className="font-display text-xl font-light text-ink">{r.adherence_score}/10</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone pt-4">
                  {r.what_improved && <div>
                    <p className="text-[10px] tracking-widests uppercase text-muted mb-1 font-body">What Improved</p>
                    <p className="text-sm text-ink font-body">{r.what_improved}</p>
                  </div>}
                  {r.program_adjustments && <div>
                    <p className="text-[10px] tracking-widests uppercase text-muted mb-1 font-body">Adjustments</p>
                    <p className="text-sm text-ink font-body">{r.program_adjustments}</p>
                  </div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline server component for add comment — we'll make it a client form
function AddTrainerComment({ photoId }: { photoId: string }) {
  return (
    <p className="text-[10px] tracking-widests uppercase text-muted font-body">
      No comment yet — use the Add Comment button below
    </p>
  );
}
