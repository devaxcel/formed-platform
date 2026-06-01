"use client";

import { useState } from "react";

type State = "idle" | "loading" | "success" | "error";

const CERTIFICATIONS = ["NASM-CPT", "ACE-CPT", "ISSA-CPT", "CSCS", "NASM-CES", "Other"];
const SPECIALTIES    = ["Strength & conditioning", "Weight loss", "Mobility & flexibility", "HIIT", "Bodybuilding", "Rehabilitation", "Sports performance", "Nutrition coaching"];

export default function TrainerApplyForm() {
  const [state,    setState]    = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    full_name:          "",
    email:              "",
    phone:              "",
    city:               "",
    zip_code:           "",
    certifications:     [] as string[],
    experience_years:   "",
    specialties:        [] as string[],
    coaching_style:     "",
    short_bio:          "",
    why_join:           "",
    training_philosophy: "",
    beginner_approach:  "",
    plateau_approach:   "",
    follows_standards:  "",
  });

  const set = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleArr = (key: "certifications" | "specialties", val: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val)
        ? f[key].filter((x) => x !== val)
        : [...f[key], val],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applications/trainer`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }

      setState("success");
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="text-center py-16">
        <div className="w-px h-12 bg-warm mx-auto mb-6" />
        <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
          Application Received
        </p>
        <h3 className="font-display text-3xl font-light text-cream mb-3">
          Thank you for applying.
        </h3>
        <p className="text-cream/50 text-sm font-body leading-relaxed max-w-xs mx-auto">
          We review all applications personally and will be in touch within
          48 hours.
        </p>
      </div>
    );
  }

  const field =
    "w-full border-b border-cream/20 bg-transparent py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-cream/60 transition-colors font-body";
  const label =
    "block text-[10px] tracking-widest uppercase text-warm/60 mb-2 font-body";
  const sectionTitle =
    "text-[10px] tracking-widest uppercase text-warm/40 pb-2 border-b border-cream/10 font-body mb-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {state === "error" && (
        <div className="border border-red-500/30 bg-red-900/20 px-4 py-3">
          <p className="text-red-300 text-sm font-body">{errorMsg}</p>
        </div>
      )}

      {/* Personal */}
      <div className="space-y-4">
        <p className={sectionTitle}>Personal Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Full Name *</label>
            <input required className={field} placeholder="Alex Rivera"
              value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </div>
          <div>
            <label className={label}>Email *</label>
            <input required type="email" className={field} placeholder="alex@email.com"
              value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className={label}>Phone *</label>
            <input required className={field} placeholder="+1 (813) 000-0000"
              value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label className={label}>City *</label>
            <input required className={field} placeholder="Tampa"
              value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Professional */}
      <div className="space-y-4">
        <p className={sectionTitle}>Professional Information</p>

        <div>
          <label className={label}>Years of Experience *</label>
          <input required type="number" min="0" max="50" className={field}
            placeholder="e.g. 5"
            value={form.experience_years}
            onChange={(e) => set("experience_years", e.target.value)} />
        </div>

        <div>
          <label className={label}>Certifications (select all)</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {CERTIFICATIONS.map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.certifications.includes(c)}
                  onChange={() => toggleArr("certifications", c)}
                  className="accent-cream w-3 h-3" />
                <span className="text-sm text-cream/80 font-body">{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Specialties (select all)</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {SPECIALTIES.map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.specialties.includes(s)}
                  onChange={() => toggleArr("specialties", s)}
                  className="accent-cream w-3 h-3" />
                <span className="text-sm text-cream/80 font-body">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Coaching Style</label>
          <input className={field} placeholder="e.g. Motivational, structured, results-focused"
            value={form.coaching_style}
            onChange={(e) => set("coaching_style", e.target.value)} />
        </div>

        <div>
          <label className={label}>Short Bio</label>
          <textarea rows={3} className={`${field} resize-none`}
            placeholder="Brief professional summary..."
            value={form.short_bio}
            onChange={(e) => set("short_bio", e.target.value)} />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        <p className={sectionTitle}>Application Questions</p>

        {[
          { key: "why_join",            label: "Why do you want to join FORMED? *",              required: true  },
          { key: "training_philosophy", label: "Describe your training philosophy *",            required: true  },
          { key: "beginner_approach",   label: "How do you handle beginner clients? *",          required: true  },
          { key: "plateau_approach",    label: "How do you handle client plateaus? *",           required: true  },
          { key: "follows_standards",   label: "Are you comfortable following FORMED standards?", required: false },
        ].map((q) => (
          <div key={q.key}>
            <label className={label}>{q.label}</label>
            <textarea rows={3}
              required={q.required}
              className={`${field} resize-none`}
              placeholder="Your answer..."
              value={(form as any)[q.key]}
              onChange={(e) => set(q.key, e.target.value)} />
          </div>
        ))}
      </div>

      <button type="submit" disabled={state === "loading"}
        className="w-full bg-cream text-ink text-[10px] tracking-widest uppercase font-body py-4 hover:bg-stone transition-colors disabled:opacity-50">
        {state === "loading" ? "Submitting..." : "Apply to Join FORMED"}
      </button>
    </form>
  );
}