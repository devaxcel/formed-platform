"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "schedule_issue",       label: "Schedule Issue" },
  { value: "billing_issue",        label: "Billing Issue" },
  { value: "trainer_issue",        label: "Trainer Issue" },
  { value: "hold_request",         label: "Pause Membership" },
  { value: "cancellation_request", label: "Cancel Membership" },
  { value: "general_question",     label: "General Question" },
];

interface NewTicketFormProps {
  userId: string;
  userRole: string;
}

export default function NewTicketForm({ userId, userRole }: NewTicketFormProps) {
  const supabase = createClient();
  const router   = useRouter();

  const [category, setCategory] = useState("");
  const [subject,  setSubject]  = useState("");
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await supabase.from("support_tickets").insert({
      submitted_by:      userId,
      submitted_by_role: userRole,
      category,
      subject,
      message,
      status: "open",
      priority: "normal",
    });

    setSuccess(true);
    setLoading(false);
    setCategory(""); setSubject(""); setMessage("");
    router.refresh();
  };

  const field = "w-full border-b border-stone bg-transparent py-2.5 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors font-body";
  const label = "block text-[10px] tracking-widest uppercase text-muted mb-2 font-body";

  if (success) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm font-body text-ink mb-1">Request submitted.</p>
        <p className="text-xs text-muted font-body">Our team will respond within 24 hours.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-[10px] tracking-widest uppercase font-body text-muted hover:text-ink transition-colors"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={label}>Category</label>
        <select
          required
          value={category}
          onChange={e => setCategory(e.target.value)}
          className={`${field} appearance-none bg-transparent`}
        >
          <option value="">Select a category...</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Subject</label>
        <input
          required className={field} placeholder="Brief subject..."
          value={subject} onChange={e => setSubject(e.target.value)}
        />
      </div>
      <div>
        <label className={label}>Message</label>
        <textarea
          required rows={4}
          className={`${field} resize-none`}
          placeholder="Describe your request in detail..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>
      <button
        type="submit" disabled={loading}
        className="bg-ink text-cream text-[10px] tracking-widest uppercase font-body px-8 py-3 hover:bg-accent transition-colors disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}