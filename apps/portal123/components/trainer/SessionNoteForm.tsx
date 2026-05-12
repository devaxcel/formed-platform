"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  sessionId:   string;
  trainerId:   string;
  sessionDate: string;
  clientName?: string;
}

const RPE_OPTIONS    = Array.from({ length: 10 }, (_, i) => i + 1);
const ENERGY_OPTIONS = ["Low", "Moderate", "High", "Excellent"];
const SESSION_TYPES  = ["Strength", "Conditioning", "Mobility", "Assessment", "Hybrid"];
const MOOD_OPTIONS   = ["Energized", "Tight", "Sore", "Fatigued", "Stressed", "Motivated"];

export default function SessionNoteForm({ sessionId, trainerId, sessionDate, clientName }: Props) {
  const supabase = createClient();
  const router   = useRouter();

  const [form, setForm] = useState({
    session_focus_type:  "Strength",
    exercises_completed: "",
    intensity_rpe:       5,
    client_energy_level: "Moderate",
    client_mood:         "",
    wins_improvements:   "",
    limitations_pain:    "",
    homework_habits:     "",
    next_session_focus:  "",
    visible_to_client:   true,
  });

  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [lastSaved,     setLastSaved]     = useState<string | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  // Calculate days overdue
  const sessionTime = new Date(sessionDate);
  const now = new Date();
  const hoursElapsed = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60);
  const daysOverdue = hoursElapsed > 12
    ? Math.floor((hoursElapsed - 12) / 24)
    : 0;

  // Auto-save draft to localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`notes_draft_${sessionId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm(prev => ({ ...prev, ...parsed }));
        setLastSaved("Draft restored");
      } catch {}
    }
  }, [sessionId]);

  const triggerAutoSave = (newForm: typeof form) => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => {
      localStorage.setItem(`notes_draft_${sessionId}`, JSON.stringify(newForm));
      setLastSaved(`Draft saved at ${new Date().toLocaleTimeString()}`);
    }, 1500);
    setAutoSaveTimer(timer);
  };

  const handleChange = (k: string, v: any) => {
    const newForm = { ...form, [k]: v };
    setForm(newForm);
    triggerAutoSave(newForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.exercises_completed) {
      setError("Please describe the exercises completed.");
      return;
    }
    if (!form.wins_improvements) {
      setError("Please add at least one key win or highlight.");
      return;
    }
    if (!form.next_session_focus) {
      setError("Please add the next session plan.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("session_notes").insert({
      session_id:          sessionId,
      trainer_id:          trainerId,
      exercises_completed: form.exercises_completed,
      intensity_rpe:       form.intensity_rpe,
      client_energy_level: form.client_energy_level,
      wins_improvements:   form.wins_improvements,
      limitations_pain:    form.limitations_pain,
      homework_habits:     form.homework_habits,
      next_session_focus:  form.next_session_focus,
      is_late:             hoursElapsed > 12,
      submitted_at:        new Date().toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    await supabase.from("sessions").update({
      notes_submitted:     true,
      notes_submitted_at:  new Date().toISOString(),
    }).eq("id", sessionId);

    // Clear draft
    localStorage.removeItem(`notes_draft_${sessionId}`);

    router.push("/trainer/notes");
    router.refresh();
  };

  const field = "w-full border-b border-stone bg-transparent py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors font-body";
  const sectionLabel = "text-[10px] tracking-widest uppercase text-muted font-body mb-2 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-stone p-6 lg:p-8">

      {/* Overdue warning */}
      {daysOverdue > 0 && (
        <div className="bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-red-700 text-xs font-body font-medium">
            These notes are {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue.
            Please submit immediately to avoid a compliance flag.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 font-body">
          {error}
        </div>
      )}

      {/* Auto-save status */}
      {lastSaved && (
        <p className="text-[10px] text-muted font-body italic">{lastSaved}</p>
      )}

      {/* Session type */}
      <div>
        <span className={sectionLabel}>Session Type *</span>
        <div className="flex flex-wrap gap-2">
          {SESSION_TYPES.map(type => (
            <button key={type} type="button"
              onClick={() => handleChange("session_focus_type", type)}
              className={`text-[10px] tracking-widests uppercase font-body px-4 py-2 transition-colors ${
                form.session_focus_type === type
                  ? "bg-ink text-cream"
                  : "bg-stone text-muted hover:bg-warm"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises */}
      <div>
        <span className={sectionLabel}>Exercises Completed *</span>
        <p className="text-[10px] text-muted font-body mb-2 italic">
          Format: Exercise — sets × reps @ weight (e.g. Squat — 3×8 @ 50kg)
        </p>
        <textarea rows={4} className={`${field} resize-none`}
          placeholder={`Squat — 3×8 @ 50kg\nRDL — 3×10 @ 40kg\nPlank — 3×45s`}
          value={form.exercises_completed}
          onChange={e => handleChange("exercises_completed", e.target.value)}
        />
      </div>

      {/* RPE + Energy + Mood */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* RPE */}
        <div>
          <span className={sectionLabel}>Intensity (RPE) *</span>
          <div className="flex gap-1.5 flex-wrap">
            {RPE_OPTIONS.map(n => (
              <button key={n} type="button"
                onClick={() => handleChange("intensity_rpe", n)}
                className={`w-8 h-8 text-xs font-body transition-colors ${
                  form.intensity_rpe === n ? "bg-ink text-cream" : "bg-stone text-muted hover:bg-warm"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted font-body mt-1">
            {form.intensity_rpe <= 3 ? "Easy" : form.intensity_rpe <= 6 ? "Moderate" : form.intensity_rpe <= 8 ? "Hard" : "Max effort"}
          </p>
        </div>

        {/* Client energy */}
        <div>
          <span className={sectionLabel}>Client Energy *</span>
          <div className="space-y-1.5">
            {ENERGY_OPTIONS.map(e => (
              <label key={e} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="energy" checked={form.client_energy_level === e}
                  onChange={() => handleChange("client_energy_level", e)}
                  className="accent-ink w-3 h-3" />
                <span className="text-sm font-body text-ink">{e}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Client mood */}
        <div>
          <span className={sectionLabel}>Client Readiness / Mood</span>
          <div className="flex flex-wrap gap-1.5">
            {MOOD_OPTIONS.map(m => (
              <button key={m} type="button"
                onClick={() => handleChange("client_mood", form.client_mood === m ? "" : m)}
                className={`text-[10px] tracking-widests uppercase font-body px-3 py-1.5 transition-colors ${
                  form.client_mood === m
                    ? "bg-ink text-cream"
                    : "bg-stone text-muted hover:bg-warm"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key wins */}
      <div>
        <span className={sectionLabel}>Key Wins / Highlights *</span>
        <p className="text-[10px] text-muted font-body mb-2 italic">
          What went well? Personal bests, technique improvements, client milestones.
        </p>
        <textarea rows={2} className={`${field} resize-none`}
          placeholder="Hit a new personal best on squat. Improved depth significantly..."
          value={form.wins_improvements}
          onChange={e => handleChange("wins_improvements", e.target.value)}
        />
      </div>

      {/* Limitations */}
      <div>
        <span className={sectionLabel}>Limitations / Pain</span>
        <textarea rows={2} className={`${field} resize-none`}
          placeholder="Any pain, discomfort, or movement limitations observed..."
          value={form.limitations_pain}
          onChange={e => handleChange("limitations_pain", e.target.value)}
        />
      </div>

      {/* Homework */}
      <div>
        <span className={sectionLabel}>Homework / Habits Assigned</span>
        <input className={field}
          placeholder="Daily stretches, walk 20 min after dinner, sleep 7+ hours..."
          value={form.homework_habits}
          onChange={e => handleChange("homework_habits", e.target.value)}
        />
      </div>

      {/* Next session plan */}
      <div>
        <span className={sectionLabel}>Next Session Plan *</span>
        <p className="text-[10px] text-muted font-body mb-2 italic">
          What will you focus on and progress in the next session?
        </p>
        <input className={field}
          placeholder="Progress squat to 55kg. Add single-leg work. Focus on core stability..."
          value={form.next_session_focus}
          onChange={e => handleChange("next_session_focus", e.target.value)}
        />
      </div>

      {/* Visible to client toggle */}
      <div className="flex items-center gap-3 py-3 border-t border-stone">
        <button
          type="button"
          onClick={() => handleChange("visible_to_client", !form.visible_to_client)}
          className={`w-10 h-5 rounded-full transition-colors relative ${
            form.visible_to_client ? "bg-ink" : "bg-stone"
          }`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            form.visible_to_client ? "left-5" : "left-0.5"
          }`} />
        </button>
        <div>
          <p className="text-sm font-body text-ink">Visible to client</p>
          <p className="text-[10px] text-muted font-body">
            {form.visible_to_client
              ? "Client can view this session summary"
              : "Private — only visible to you and admin"}
          </p>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-ink text-cream text-[10px] tracking-widest uppercase font-body py-4 hover:bg-accent transition-colors disabled:opacity-50">
        {loading ? "Submitting..." : "Submit Session Notes"}
      </button>

      <p className="text-[10px] text-muted font-body text-center">
        Notes must be submitted within 12 hours of the session.
        {lastSaved && <span className="block mt-1">{lastSaved}</span>}
      </p>
    </form>
  );
}