"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Check, ArrowUpRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Plan = {
  key: string;
  label: string;
  sessions: string;
  price: string;
  monthly: number;
  best: string;
  highlight?: boolean;
};

interface Props {
  currentPlan: string;
  plans: Plan[];
  clientId?: string;
}

// ── Upgrade Modal ─────────────────────────────────────────────────────────────

function UpgradeModal({ plans, currentPlan, onClose, onUpgrade }: {
  plans: Plan[]; currentPlan: string; onClose: () => void; onUpgrade: (plan: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const upgradePlans = plans.filter(p => p.monthly > (plans.find(x => x.key === currentPlan)?.monthly ?? 0));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-stone">
          <div>
            <h2 className="font-display text-2xl font-light text-ink">Upgrade Your Membership</h2>
            <p className="text-[10px] tracking-widests uppercase text-muted font-body mt-1">Choose the plan that fits your goals</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {plans.map(plan => {
              const isCurrent = plan.key === currentPlan;
              const isSelected = selected === plan.key;
              const isUpgrade = plan.monthly > (plans.find(x => x.key === currentPlan)?.monthly ?? 0);

              return (
                <button key={plan.key}
                  onClick={() => !isCurrent && isUpgrade && setSelected(plan.key)}
                  disabled={isCurrent || !isUpgrade}
                  className={cn(
                    "border p-5 text-left transition-all relative",
                    isCurrent ? "border-stone bg-cream opacity-60 cursor-default" :
                    !isUpgrade ? "border-stone bg-cream opacity-40 cursor-default" :
                    isSelected ? "border-ink bg-white" :
                    plan.highlight ? "border-warm bg-warm/5 hover:border-ink" :
                    "border-stone bg-white hover:border-warm"
                  )}>
                  {plan.highlight && !isCurrent && (
                    <span className="absolute -top-2 left-4 bg-ink text-cream text-[9px] tracking-widests uppercase font-body px-2 py-0.5">
                      Most popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute -top-2 left-4 bg-stone text-muted text-[9px] tracking-widests uppercase font-body px-2 py-0.5">
                      Current
                    </span>
                  )}
                  <p className="font-display text-lg font-light text-ink mb-1">{plan.label}</p>
                  <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-3">{plan.sessions}</p>
                  <p className="font-display text-2xl font-light text-ink">{plan.price}</p>
                  <p className="text-[10px] text-muted font-body">/month</p>
                  <p className="text-xs text-muted font-body mt-3 leading-relaxed">Best for: {plan.best}</p>
                  {isSelected && <Check size={14} className="absolute top-4 right-4 text-ink" />}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="bg-cream border border-stone p-4 mb-5">
              <p className="text-sm font-body text-ink">
                Upgrading to <strong>{plans.find(p => p.key === selected)?.label}</strong> takes effect immediately.
                Your rate will adjust to <strong>{plans.find(p => p.key === selected)?.price}/month</strong>.
              </p>
            </div>
          )}

          <button
            onClick={async () => {
              if (!selected) return;
              setLoading(true);
              await onUpgrade(selected);
              setLoading(false);
            }}
            disabled={!selected || loading}
            className="w-full bg-ink text-cream text-[10px] tracking-widests uppercase font-body py-4 hover:bg-accent transition-colors disabled:opacity-40">
            {loading ? "Upgrading..." : selected ? `Upgrade to ${plans.find(p => p.key === selected)?.label}` : "Select a Plan Above"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Request Change Modal ──────────────────────────────────────────────────────

function RequestChangeModal({ type, onClose, onSubmit }: {
  type: "downgrade" | "pause" | "cancel"; onClose: () => void; onSubmit: (reason: string, notes: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const config = {
    downgrade: {
      title: "Request Membership Change",
      subtitle: "A team member will review and follow up within 24 hours.",
      reasons: ["Budget concerns", "Schedule conflict", "Not using all sessions", "Prefer fewer sessions", "Other"],
      submitLabel: "Submit Change Request",
    },
    pause: {
      title: "Request Membership Pause",
      subtitle: "Tell us why you need to pause. Our team will be in touch.",
      reasons: ["Travel / vacation", "Injury or illness", "Work or life change", "Financial reasons", "Other"],
      submitLabel: "Submit Pause Request",
    },
    cancel: {
      title: "Request Cancellation",
      subtitle: "We're sorry to see you go. Your feedback helps us improve.",
      reasons: ["Too expensive", "Schedule conflict", "Moving away", "Not using enough", "Trainer mismatch", "Achieved my goals", "Other"],
      submitLabel: "Submit Cancellation Request",
    },
  }[type];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-stone">
          <div>
            <h2 className="font-display text-xl font-light text-ink">{config.title}</h2>
            <p className="text-xs text-muted font-body mt-0.5">{config.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-[10px] tracking-widests uppercase text-muted mb-3 font-body">Reason</p>
            <div className="space-y-2">
              {config.reasons.map(r => (
                <label key={r} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)}
                    className="w-3.5 h-3.5 accent-ink" />
                  <span className="text-sm font-body text-ink">{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-widests uppercase text-muted mb-2 font-body">Additional Notes (Optional)</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Tell us anything that would help us serve you better..."
              className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink resize-none" />
          </div>
          {type === "cancel" && (
            <div className="bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs font-body text-amber-800 leading-relaxed">
                Before cancelling — have you spoken to your trainer? Many clients find that a quick conversation resolves concerns. We're also happy to adjust your plan or pause your membership.
              </p>
            </div>
          )}
          <button onClick={async () => {
            if (!reason) return;
            setLoading(true);
            await onSubmit(reason, notes);
            setLoading(false);
          }} disabled={!reason || loading}
            className={cn("w-full text-[10px] tracking-widests uppercase font-body py-4 transition-colors disabled:opacity-40",
              type === "cancel" ? "bg-red-600 text-white hover:bg-red-700" : "bg-ink text-cream hover:bg-accent")}>
            {loading ? "Submitting..." : config.submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MembershipActions({ currentPlan, plans, clientId }: Props) {
  const supabase = createClient();
  const [modal, setModal] = useState<"upgrade" | "downgrade" | "pause" | "cancel" | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpgrade = async (planKey: string) => {
    if (!clientId) return;
    const plan = plans.find(p => p.key === planKey);
    if (!plan) return;
    await supabase.from("clients").update({ plan_type: planKey, monthly_rate: plan.monthly }).eq("id", clientId);
    // Create support ticket to notify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("support_tickets").insert({
        submitted_by: user.id, submitted_by_role: "client",
        category: "billing", subject: `Membership upgraded to ${plan.label}`,
        message: `Client requested upgrade to ${plan.label} (${plan.price}/month). Updated automatically.`,
        status: "in_progress", priority: "normal",
      });
    }
    setModal(null);
    setSuccess(`Membership upgraded to ${plan.label}! Your trainer has been notified.`);
    setTimeout(() => window.location.reload(), 2000);
  };

  const handleRequest = async (type: string, reason: string, notes: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const subjects = {
      downgrade: "Membership downgrade request",
      pause: "Membership pause request",
      cancel: "Cancellation request",
    } as Record<string, string>;
    await supabase.from("support_tickets").insert({
      submitted_by: user.id, submitted_by_role: "client",
      category: "billing", subject: subjects[type],
      message: `Reason: ${reason}${notes ? `\n\nAdditional notes: ${notes}` : ""}`,
      status: "open", priority: type === "cancel" ? "high" : "normal",
    });
    setModal(null);
    setSuccess(
      type === "cancel"
        ? "Cancellation request submitted. A team member will reach out within 24 hours."
        : type === "pause"
        ? "Pause request submitted. We'll be in touch within 24 hours."
        : "Change request submitted. A team member will follow up with you."
    );
  };

  const currentPlanObj = plans.find(p => p.key === currentPlan);
  const canUpgrade = plans.some(p => p.monthly > (currentPlanObj?.monthly ?? 0));

  return (
    <>
      {modal === "upgrade" && (
        <UpgradeModal plans={plans} currentPlan={currentPlan} onClose={() => setModal(null)} onUpgrade={handleUpgrade} />
      )}
      {(modal === "downgrade" || modal === "pause" || modal === "cancel") && (
        <RequestChangeModal type={modal} onClose={() => setModal(null)}
          onSubmit={(reason, notes) => handleRequest(modal, reason, notes)} />
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-body text-green-800 leading-relaxed">{success}</p>
        </div>
      )}

      {/* Upgrade CTA */}
      {canUpgrade && (
        <div className="bg-white border border-stone p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-1">Membership Upgrade</p>
              <p className="font-display text-xl font-light text-ink mb-1">
                Train more, achieve faster results
              </p>
              <p className="text-sm text-muted font-body leading-relaxed">
                Upgrade your plan to unlock more sessions per week. No long-term commitment required.
              </p>
            </div>
            <button onClick={() => setModal("upgrade")}
              className="flex items-center gap-2 bg-ink text-cream text-[10px] tracking-widests uppercase font-body px-5 py-3 hover:bg-accent transition-colors flex-shrink-0">
              <ArrowUpRight size={12} /> Upgrade Plan
            </button>
          </div>
        </div>
      )}

      {/* Membership management */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => setModal("pause")}
          className="text-center text-[10px] tracking-widests uppercase font-body px-5 py-3.5 border border-stone hover:border-warm text-muted hover:text-ink transition-colors">
          Request a Pause
        </button>
        <button onClick={() => setModal("downgrade")}
          className="text-center text-[10px] tracking-widests uppercase font-body px-5 py-3.5 border border-stone hover:border-amber-400 text-muted hover:text-amber-700 transition-colors">
          Change Plan
        </button>
        <button onClick={() => setModal("cancel")}
          className="text-center text-[10px] tracking-widests uppercase font-body px-5 py-3.5 border border-stone hover:border-red-300 text-muted hover:text-red-600 transition-colors">
          Cancel Membership
        </button>
      </div>
    </>
  );
}
