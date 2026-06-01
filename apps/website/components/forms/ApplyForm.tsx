"use client";

import { useState } from "react";

const goals      = ["Strength & muscle", "Weight loss", "Mobility & longevity", "General fitness", "Other"];
const levels     = ["Beginner", "Intermediate", "Advanced"];
const schedules  = ["Early morning (5–8am)", "Morning (8–11am)", "Midday (11–2pm)", "Afternoon (2–5pm)", "Evening (5–8pm)"];
const frequencies = ["1x per week", "2x per week", "3x per week"];
const locations  = ["Home", "Condo / Apartment gym", "Office / Private gym"];

type State = "idle" | "loading" | "success" | "error";

export default function ApplyForm() {
  const [state,   setState]   = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    full_name:     "",
    email:         "",
    phone:         "",
    city:          "",
    location_type: "",
    goal:          "",
    level:         "",
    schedules:     [] as string[],
    frequency:     "",
    pricing_ok:    "",
    other_info:    "",
    source:        "",
  });

  const set = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleSchedule = (s: string) =>
    setForm((f) => ({
      ...f,
      schedules: f.schedules.includes(s)
        ? f.schedules.filter((x) => x !== s)
        : [...f.schedules, s],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applications/client`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrorMsg(
            "An account with this email already exists. Please sign in at portal.formed.fit"
          );
        } else {
          setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        }
        setState("error");
        return;
      }

      setState("success");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (state === "success") {
    return (
      <div className="text-center py-20">
        <div className="w-px h-16 bg-warm mx-auto mb-8" />
        <p className="text-[10px] tracking-ultra uppercase text-muted mb-4 font-body">
          Application Received
        </p>
        <h2 className="font-display text-4xl font-light text-ink mb-4">
          Thank you.
        </h2>
        <p className="text-muted text-sm leading-relaxed max-w-sm mx-auto font-body mb-6">
          Our team will review your application and follow up within 24–48
          hours. Check your email for a confirmation.
        </p>
        {/* NEW: What happens next in success state */}
        <div className="bg-stone/30 p-4 max-w-sm mx-auto rounded-sm">
          <p className="text-[10px] tracking-ultra uppercase text-muted mb-2 font-body">
            What happens next
          </p>
          <p className="text-xs text-ink font-body">
            We'll match you with a vetted trainer and schedule your first session.
          </p>
        </div>
      </div>
    );
  }

  const field =
    "w-full border-b border-stone bg-transparent py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors font-body";
  const label =
    "block text-[10px] tracking-ultra uppercase text-muted mb-2 font-body";
  const radioLabel =
    "flex items-center gap-3 cursor-pointer group py-1";
  const radioText =
    "text-sm text-ink font-body group-hover:text-muted transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error message */}
      {state === "error" && (
        <div className="border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-red-700 text-sm font-body">{errorMsg}</p>
        </div>
      )}

      {/* Personal info */}
      <div className="space-y-4">
        <p className="text-[10px] tracking-ultra uppercase text-ink pb-2 border-b border-stone font-body">
          Personal Information
        </p>
        <div>
          <label className={label}>Full Name *</label>
          <input
            required
            className={field}
            placeholder="Jane Smith"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Email *</label>
            <input
              required
              type="email"
              className={field}
              placeholder="jane@email.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Phone *</label>
            <input
              required
              className={field}
              placeholder="+1 (813) 000-0000"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={label}>City / Neighbourhood *</label>
          <input
            required
            className={field}
            placeholder="e.g. South Tampa"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-[10px] tracking-ultra uppercase text-ink pb-2 border-b border-stone font-body mb-4">
          Where would training take place?
        </p>
        <div className="space-y-2">
          {locations.map((l) => (
            <label key={l} className={radioLabel}>
              <input
                type="radio"
                name="location"
                value={l}
                required
                checked={form.location_type === l}
                onChange={() => set("location_type", l)}
                className="accent-ink w-3.5 h-3.5"
              />
              <span className={radioText}>{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Goal */}
      <div>
        <p className="text-[10px] tracking-ultra uppercase text-ink pb-2 border-b border-stone font-body mb-4">
          Primary Goal
        </p>
        <div className="space-y-2">
          {goals.map((g) => (
            <label key={g} className={radioLabel}>
              <input
                type="radio"
                name="goal"
                value={g}
                required
                checked={form.goal === g}
                onChange={() => set("goal", g)}
                className="accent-ink w-3.5 h-3.5"
              />
              <span className={radioText}>{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <p className="text-[10px] tracking-ultra uppercase text-ink pb-2 border-b border-stone font-body mb-4">
          Training Experience
        </p>
        <div className="space-y-2">
          {levels.map((l) => (
            <label key={l} className={radioLabel}>
              <input
                type="radio"
                name="level"
                value={l}
                required
                checked={form.level === l}
                onChange={() => set("level", l)}
                className="accent-ink w-3.5 h-3.5"
              />
              <span className={radioText}>{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div>
        <p className="text-[10px] tracking-ultra uppercase text-ink pb-2 border-b border-stone font-body mb-4">
          Preferred Schedule (select all that apply)
        </p>
        <div className="space-y-2">
          {schedules.map((s) => (
            <label key={s} className={radioLabel}>
              <input
                type="checkbox"
                value={s}
                checked={form.schedules.includes(s)}
                onChange={() => toggleSchedule(s)}
                className="accent-ink w-3.5 h-3.5"
              />
              <span className={radioText}>{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div>
        <p className="text-[10px] tracking-ultra uppercase text-ink pb-2 border-b border-stone font-body mb-4">
          Sessions per week
        </p>
        <div className="space-y-2">
          {frequencies.map((f) => (
            <label key={f} className={radioLabel}>
              <input
                type="radio"
                name="frequency"
                value={f}
                required
                checked={form.frequency === f}
                onChange={() => set("frequency", f)}
                className="accent-ink w-3.5 h-3.5"
              />
              <span className={radioText}>{f}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <p className="text-[10px] tracking-ultra uppercase text-ink pb-2 border-b border-stone font-body mb-4">
          Are you prepared for memberships starting at $520/month?
        </p>
        <div className="space-y-2">
          {["Yes", "No"].map((v) => (
            <label key={v} className={radioLabel}>
              <input
                type="radio"
                name="pricing"
                value={v}
                required
                checked={form.pricing_ok === v}
                onChange={() => set("pricing_ok", v)}
                className="accent-ink w-3.5 h-3.5"
              />
              <span className={radioText}>{v}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Source */}
      <div>
        <label className={label}>How did you hear about FORMED?</label>
        <input
          className={field}
          placeholder="Instagram, referral, Google..."
          value={form.source}
          onChange={(e) => set("source", e.target.value)}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={label}>Anything we should know?</label>
        <textarea
          rows={4}
          className={`${field} resize-none`}
          placeholder="Injuries, schedule constraints, specific goals..."
          value={form.other_info}
          onChange={(e) => set("other_info", e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full bg-ink text-cream text-[10px] tracking-ultra uppercase font-body py-5 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "Submitting..." : "Apply for Membership"}
      </button>
    </form>
  );
}