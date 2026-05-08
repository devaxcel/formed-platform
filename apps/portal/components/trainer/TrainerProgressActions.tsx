"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TrainerProgressActions({ clientId }: { clientId: string }) {
  const supabase = createClient();
  const [showAssessment, setShowAssessment] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Assessment form state
  const [weightKg, setWeightKg] = useState("");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [adherence, setAdherence] = useState<number | null>(null);
  const [whatImproved, setWhatImproved] = useState("");
  const [whatStalled, setWhatStalled] = useState("");
  const [adjustments, setAdjustments] = useState("");
  const [consistencyScore, setConsistencyScore] = useState<number | null>(null);

  // Comment form state
  const [photoId, setPhotoId] = useState("");
  const [comment, setComment] = useState("");

  const handleAssessment = async () => {
    setSaving(true);
    const { data: trainer } = await (await createClient()).auth.getUser();
    await supabase.from("client_progress").insert({
      client_id: clientId,
      recorded_at: new Date().toISOString(),
      body_weight_kg: weightKg ? parseFloat(weightKg) : null,
      body_fat_pct: bodyFatPct ? parseFloat(bodyFatPct) : null,
      adherence_score: adherence,
      consistency_score: consistencyScore,
      what_improved: whatImproved || null,
      what_stalled: whatStalled || null,
      program_adjustments: adjustments || null,
      is_monthly_review: true,
    });
    setSaving(false);
    setSuccess(true);
    setShowAssessment(false);
    setTimeout(() => { setSuccess(false); window.location.reload(); }, 1500);
  };

  const handleComment = async () => {
    if (!photoId || !comment) return;
    setSaving(true);
    await supabase.from("progress_photos").update({ trainer_comment: comment }).eq("id", photoId);
    setSaving(false);
    setSuccess(true);
    setShowComment(false);
    setTimeout(() => { setSuccess(false); window.location.reload(); }, 1500);
  };

  const RatingRow = ({ label, value, onChange, max = 10 }: { label: string; value: number | null; onChange: (v: number) => void; max?: number }) => (
    <div>
      <p className="text-[10px] tracking-widests uppercase text-muted mb-2 font-body">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
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
    <div className="space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 p-4 flex items-center gap-2">
          <Check size={14} className="text-green-600" />
          <p className="text-sm font-body text-green-800">Saved successfully.</p>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button onClick={() => { setShowAssessment(!showAssessment); setShowComment(false); }}
          className="flex items-center gap-2 bg-ink text-cream text-[10px] tracking-widests uppercase font-body px-4 py-2.5 hover:bg-accent transition-colors">
          <Plus size={11} /> Monthly Assessment
        </button>
        <button onClick={() => { setShowComment(!showComment); setShowAssessment(false); }}
          className="flex items-center gap-2 border border-stone text-muted text-[10px] tracking-widests uppercase font-body px-4 py-2.5 hover:border-warm hover:text-ink transition-colors">
          <Plus size={11} /> Add Photo Comment
        </button>
      </div>

      {/* Monthly Assessment Form */}
      {showAssessment && (
        <div className="bg-white border border-stone p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-light text-ink">Monthly Assessment</p>
            <button onClick={() => setShowAssessment(false)} className="text-muted hover:text-ink"><X size={16} /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">Body Weight (kg)</label>
              <input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="e.g. 72.5"
                className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink" />
            </div>
            <div>
              <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">Body Fat %</label>
              <input type="number" value={bodyFatPct} onChange={e => setBodyFatPct(e.target.value)} placeholder="e.g. 18"
                className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink" />
            </div>
          </div>

          <RatingRow label="Adherence Score (1-10)" value={adherence} onChange={setAdherence} max={10} />
          <RatingRow label="Consistency Score (1-10)" value={consistencyScore} onChange={setConsistencyScore} max={10} />

          <div>
            <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">What Improved</label>
            <textarea rows={2} value={whatImproved} onChange={e => setWhatImproved(e.target.value)}
              placeholder="e.g. Down 6 lbs. Improved posture and consistency. Dumbbell press 20 → 35 lbs."
              className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink resize-none" />
          </div>

          <div>
            <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">What Stalled / Challenges</label>
            <textarea rows={2} value={whatStalled} onChange={e => setWhatStalled(e.target.value)}
              placeholder="e.g. Missed 2 sessions due to travel. Nutrition needs work."
              className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink resize-none" />
          </div>

          <div>
            <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">Programme Adjustments</label>
            <textarea rows={2} value={adjustments} onChange={e => setAdjustments(e.target.value)}
              placeholder="e.g. Increasing intensity. Adding mobility work. Shifting focus to upper body."
              className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink resize-none" />
          </div>

          <button onClick={handleAssessment} disabled={saving}
            className="w-full bg-ink text-cream text-[10px] tracking-widests uppercase font-body py-3.5 hover:bg-accent transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Monthly Assessment"}
          </button>
        </div>
      )}

      {/* Comment Form */}
      {showComment && (
        <div className="bg-white border border-stone p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-light text-ink">Add Photo Comment</p>
            <button onClick={() => setShowComment(false)} className="text-muted hover:text-ink"><X size={16} /></button>
          </div>
          <div>
            <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">Photo ID (from URL)</label>
            <input type="text" value={photoId} onChange={e => setPhotoId(e.target.value)} placeholder="Paste photo record ID"
              className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink font-mono" />
            <p className="text-[10px] text-muted font-body mt-1">You can find this in the photo card above</p>
          </div>
          <div>
            <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">Comment</label>
            <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="e.g. Great progress this month. Posture has improved significantly..."
              className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink resize-none" />
          </div>
          <button onClick={handleComment} disabled={saving || !photoId || !comment}
            className="w-full bg-ink text-cream text-[10px] tracking-widests uppercase font-body py-3.5 hover:bg-accent transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Comment"}
          </button>
        </div>
      )}
    </div>
  );
}
