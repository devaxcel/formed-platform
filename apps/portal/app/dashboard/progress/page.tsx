"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, Camera, ChevronLeft, ChevronRight, Lock, X, Plus } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

// ── Before/After Slider ───────────────────────────────────────────────────────

function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 overflow-hidden cursor-ew-resize select-none bg-stone"
      onMouseDown={() => { dragging.current = true; }}
      onMouseMove={(e) => { if (dragging.current) handleMove(e.clientX); }}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center gap-0">
          <ChevronLeft size={10} className="text-ink" />
          <ChevronRight size={10} className="text-ink" />
        </div>
      </div>
      <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] tracking-widests uppercase font-body px-2 py-1 z-10">Before</span>
      <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] tracking-widests uppercase font-body px-2 py-1 z-10">After</span>
    </div>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────

function CheckInModal({ clientId, isBaseline, onClose, onSuccess }: {
  clientId: string; isBaseline: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const supabase = createClient();
  const [files, setFiles] = useState<{ front: File | null; side: File | null; back: File | null }>({ front: null, side: null, back: null });
  const [previews, setPreviews] = useState<{ front: string | null; side: string | null; back: string | null }>({ front: null, side: null, back: null });
  const [weight, setWeight] = useState("");
  const [energy, setEnergy] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pickFile = (angle: "front" | "side" | "back") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFiles(prev => ({ ...prev, [angle]: f }));
    setPreviews(prev => ({ ...prev, [angle]: URL.createObjectURL(f) }));
  };

  const uploadPhoto = async (file: File, angle: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `progress/${clientId}/${Date.now()}_${angle}.${ext}`;
    const { error } = await supabase.storage.from("progress-photos").upload(path, file, { upsert: true });
    if (error) return null;
    return supabase.storage.from("progress-photos").getPublicUrl(path).data.publicUrl;
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const [frontUrl, sideUrl, backUrl] = await Promise.all([
        files.front ? uploadPhoto(files.front, "front") : Promise.resolve(null),
        files.side  ? uploadPhoto(files.side,  "side")  : Promise.resolve(null),
        files.back  ? uploadPhoto(files.back,  "back")  : Promise.resolve(null),
      ]);
      const { error: dbError } = await supabase.from("progress_photos").insert({
        client_id: clientId, recorded_at: new Date().toISOString(),
        front_url: frontUrl, side_url: sideUrl, back_url: backUrl,
        weight_lbs: weight ? parseFloat(weight) : null,
        energy_level: energy, sleep_quality: sleep,
        wins: wins || null, challenges: challenges || null,
        is_baseline: isBaseline, visible_to_trainer: true,
        consent_marketing: consent,
      });
      if (dbError) throw dbError;
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    }
    setSaving(false);
  };

  const PhotoSlot = ({ angle }: { angle: "front" | "side" | "back" }) => (
    <label className="cursor-pointer block">
      <div className={cn("aspect-[3/4] border-2 border-dashed flex flex-col items-center justify-center transition-colors overflow-hidden bg-cream",
        previews[angle] ? "border-ink" : "border-stone hover:border-warm")}>
        {previews[angle] ? (
          <img src={previews[angle]!} alt={angle} className="w-full h-full object-cover" />
        ) : (
          <>
            <Camera size={18} className="text-muted mb-1.5" />
            <p className="text-[10px] tracking-widests uppercase font-body text-muted capitalize">{angle}</p>
          </>
        )}
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={pickFile(angle)} />
    </label>
  );

  const RatingRow = ({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number) => void }) => (
    <div>
      <p className="text-[10px] tracking-widests uppercase text-muted mb-2 font-body">{label}</p>
      <div className="flex gap-1.5">
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={cn("w-8 h-8 text-xs font-body border transition-colors",
              value === n ? "bg-ink text-cream border-ink" : "border-stone text-muted hover:border-warm")}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-5 border-b border-stone">
          <div>
            <h2 className="font-display text-xl font-light text-ink">
              {isBaseline ? "Baseline Photos" : "Monthly Check-In"}
            </h2>
            <p className="text-[10px] tracking-widests uppercase text-muted font-body mt-0.5">
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <p className="text-[10px] tracking-widests uppercase text-muted mb-3 font-body">Photos (Front / Side / Back)</p>
            <div className="grid grid-cols-3 gap-3">
              <PhotoSlot angle="front" /><PhotoSlot angle="side" /><PhotoSlot angle="back" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">Current Weight (lbs)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 165"
              className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink" />
          </div>
          <RatingRow label="Energy Level (1-5)" value={energy} onChange={setEnergy} />
          <RatingRow label="Sleep Quality (1-5)" value={sleep} onChange={setSleep} />
          <div>
            <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">Wins This Month</label>
            <textarea rows={2} value={wins} onChange={e => setWins(e.target.value)} placeholder="What went well?"
              className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink resize-none" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">Challenges</label>
            <textarea rows={2} value={challenges} onChange={e => setChallenges(e.target.value)} placeholder="What was hard?"
              className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink resize-none" />
          </div>
          <div className="bg-cream border border-stone p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-muted" />
              <p className="text-[10px] tracking-widests uppercase text-muted font-body">Privacy</p>
            </div>
            <p className="text-xs text-muted font-body">Visible only to you and your trainer. Never shared publicly.</p>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="w-4 h-4 mt-0.5" />
              <span className="text-xs font-body text-ink leading-relaxed">I consent to FORMED using my photos anonymously for marketing or testimonials</span>
            </label>
          </div>
          {error && <p className="text-red-500 text-xs font-body">{error}</p>}
          <button onClick={handleSubmit} disabled={saving}
            className="w-full bg-ink text-cream text-[10px] tracking-widests uppercase font-body py-4 hover:bg-accent transition-colors disabled:opacity-50">
            {saving ? "Uploading..." : "Submit Check-In"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const supabase = createClient();
  const [client, setClient] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [monthSessions, setMonthSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [angle, setAngle] = useState<"front_url"|"side_url"|"back_url">("front_url");

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: clientData } = await supabase.from("clients").select("id, full_name").eq("user_id", user.id).single();
    setClient(clientData);
    if (clientData) {
      const [photosRes, progressRes, totalRes, monthRes] = await Promise.all([
        supabase.from("progress_photos").select("*").eq("client_id", clientData.id).order("recorded_at", { ascending: false }),
        supabase.from("client_progress").select("*").eq("client_id", clientData.id).order("recorded_at", { ascending: false }),
        supabase.from("sessions").select("*", { count: "exact", head: true }).eq("client_id", clientData.id).eq("booking_status", "completed"),
        supabase.from("sessions").select("*", { count: "exact", head: true }).eq("client_id", clientData.id).eq("booking_status", "completed")
          .gte("date_time", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ]);
      setPhotos(photosRes.data ?? []);
      setProgress(progressRes.data ?? []);
      setTotalSessions(totalRes.count ?? 0);
      setMonthSessions(monthRes.count ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const hasBaseline = photos.some(p => p.is_baseline);
  const baseline = photos.find(p => p.is_baseline);
  const latest = photos.filter(p => !p.is_baseline)[0];
  const monthlyReviews = progress.filter(p => p.is_monthly_review);
  const latestWeight = photos[0]?.weight_lbs;

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-10">
      {showModal && client && (
        <CheckInModal clientId={client.id} isBaseline={!hasBaseline}
          onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); load(); }} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-1">Journey</p>
          <h1 className="font-display text-3xl font-light text-ink">Progress Tracking</h1>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-ink text-cream text-[10px] tracking-widests uppercase font-body px-5 py-3 hover:bg-accent transition-colors">
          <Plus size={12} />
          {hasBaseline ? "Monthly Check-In" : "Upload Baseline Photos"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Sessions", value: totalSessions, sub: "completed" },
          { label: "This Month", value: monthSessions, sub: "sessions" },
          { label: "Check-Ins", value: photos.length, sub: "uploaded" },
          { label: "Latest Weight", value: latestWeight ? `${latestWeight} lbs` : "—", sub: "recorded" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white border border-stone p-5">
            <p className="text-[10px] tracking-widests uppercase text-muted mb-1 font-body">{label}</p>
            <p className="font-display text-2xl font-light text-ink">{value}</p>
            <p className="text-xs text-muted font-body mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Baseline prompt */}
      {!hasBaseline && (
        <div className="bg-ink text-cream p-10 text-center">
          <Camera size={32} className="mx-auto mb-4 text-cream/40" />
          <p className="font-display text-2xl font-light mb-2">Start with baseline photos</p>
          <p className="text-cream/60 text-sm font-body mb-6 max-w-sm mx-auto leading-relaxed">
            Upload your front, side, and back photos today to establish your starting point. All photos are private — visible only to you and your trainer.
          </p>
          <button onClick={() => setShowModal(true)}
            className="bg-cream text-ink text-[10px] tracking-widests uppercase font-body px-8 py-3 hover:bg-stone transition-colors">
            Upload Baseline Photos
          </button>
        </div>
      )}

      {/* Before / After Slider */}
      {hasBaseline && latest && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-0.5">Visual Comparison</p>
              <h2 className="font-display text-2xl font-light text-ink">Before / After</h2>
            </div>
            <div className="flex gap-1">
              {([["front_url","Front"],["side_url","Side"],["back_url","Back"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setAngle(key as any)}
                  className={cn("px-3 py-1.5 text-[10px] tracking-widests uppercase font-body transition-colors",
                    angle === key ? "bg-ink text-cream" : "border border-stone text-muted hover:border-warm")}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {baseline[angle] && latest[angle] ? (
            <>
              <BeforeAfterSlider before={baseline[angle]} after={latest[angle]} />
              <div className="flex items-center justify-between mt-2 text-xs text-muted font-body">
                <span>{formatDate(baseline.recorded_at)} — Baseline</span>
                <span>{formatDate(latest.recorded_at)} — Latest</span>
              </div>
            </>
          ) : (
            <div className="bg-stone h-64 flex items-center justify-center border border-stone">
              <p className="text-muted text-sm font-body">No {angle.replace("_url","")} photo available for this angle yet</p>
            </div>
          )}
        </div>
      )}

      {/* Photo Timeline */}
      {photos.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">Photo Timeline</p>
          <div className="space-y-6">
            {photos.map((photo, idx) => (
              <div key={photo.id} className="bg-white border border-stone">
                <div className="flex items-center justify-between gap-4 p-5 border-b border-stone">
                  <div>
                    <p className="font-display text-lg font-light text-ink">
                      {new Date(photo.recorded_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-[10px] tracking-widests uppercase text-muted font-body">
                      {photo.is_baseline ? "Baseline" : `Check-In #${photos.filter((p:any) => !p.is_baseline).indexOf(photo) + 1}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock size={11} className="text-muted" />
                    <p className="text-[10px] text-muted font-body">Private</p>
                  </div>
                </div>

                {/* Photos grid */}
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

                {/* Metrics */}
                <div className="p-5 flex flex-wrap gap-6">
                  {photo.weight_lbs && (
                    <div><p className="text-[10px] tracking-widests uppercase text-muted mb-1 font-body">Weight</p>
                    <p className="font-display text-xl font-light text-ink">{photo.weight_lbs} <span className="text-sm text-muted">lbs</span></p></div>
                  )}
                  {photo.energy_level && (
                    <div><p className="text-[10px] tracking-widests uppercase text-muted mb-1 font-body">Energy</p>
                    <p className="font-display text-xl font-light text-ink">{photo.energy_level}<span className="text-sm text-muted">/5</span></p></div>
                  )}
                  {photo.sleep_quality && (
                    <div><p className="text-[10px] tracking-widests uppercase text-muted mb-1 font-body">Sleep</p>
                    <p className="font-display text-xl font-light text-ink">{photo.sleep_quality}<span className="text-sm text-muted">/5</span></p></div>
                  )}
                </div>

                {(photo.wins || photo.challenges) && (
                  <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone pt-4">
                    {photo.wins && <div><p className="text-[10px] tracking-widests uppercase text-muted mb-1.5 font-body">Wins</p>
                      <p className="text-sm text-ink font-body leading-relaxed">{photo.wins}</p></div>}
                    {photo.challenges && <div><p className="text-[10px] tracking-widests uppercase text-muted mb-1.5 font-body">Challenges</p>
                      <p className="text-sm text-ink font-body leading-relaxed">{photo.challenges}</p></div>}
                  </div>
                )}

                {photo.trainer_comment && (
                  <div className="mx-5 mb-5 bg-ink/5 border-l-2 border-ink p-4">
                    <p className="text-[10px] tracking-widests uppercase text-muted mb-1.5 font-body">Trainer Comment</p>
                    <p className="text-sm text-ink font-body leading-relaxed italic">{photo.trainer_comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Reviews */}
      {monthlyReviews.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">Trainer Monthly Reviews</p>
          <div className="space-y-4">
            {monthlyReviews.map((review: any) => (
              <div key={review.id} className="bg-white border border-stone p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <p className="font-display text-lg font-light text-ink">
                    {new Date(review.recorded_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                  {review.adherence_score && (
                    <div className="text-right">
                      <p className="text-[10px] tracking-widests uppercase text-muted font-body">Adherence</p>
                      <p className="font-display text-xl font-light text-ink">{review.adherence_score}/10</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-stone pt-4">
                  {review.what_improved && <div>
                    <p className="text-[10px] tracking-widests uppercase text-muted mb-1.5 font-body">What Improved</p>
                    <p className="text-sm text-ink font-body leading-relaxed">{review.what_improved}</p>
                  </div>}
                  {review.what_stalled && <div>
                    <p className="text-[10px] tracking-widests uppercase text-muted mb-1.5 font-body">What Stalled</p>
                    <p className="text-sm text-ink font-body leading-relaxed">{review.what_stalled}</p>
                  </div>}
                  {review.program_adjustments && <div className="sm:col-span-2">
                    <p className="text-[10px] tracking-widests uppercase text-muted mb-1.5 font-body">Programme Adjustments</p>
                    <p className="text-sm text-ink font-body leading-relaxed">{review.program_adjustments}</p>
                  </div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="bg-white border border-stone p-12 text-center">
          <TrendingUp size={32} className="text-muted mx-auto mb-4" />
          <p className="font-display text-xl font-light text-ink mb-2">Your journey starts here</p>
          <p className="text-muted text-sm font-body">Upload your first photos to begin tracking your progress.</p>
        </div>
      )}
    </div>
  );
}
