"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentSetup from "@/components/portal/PaymentSetup";

type OnboardingStatus = {
  membership_agreement_signed?: boolean;
  liability_waiver_signed?: boolean;
  auto_bill_authorized?: boolean;
  health_intake_completed?: boolean;
  payment_method_on_file?: boolean;
  membership_agreement_signed_at?: string;
  liability_waiver_signed_at?: string;
  auto_bill_authorized_at?: string;
  health_intake_completed_at?: string;
  payment_method_on_file_at?: string;
  health_intake_data?: HealthIntakeData;
  [key: string]: boolean | string | HealthIntakeData | undefined;
};

type HealthIntakeData = {
  primary_goals: string[];
  fitness_level: string;
  training_history: string;
  injuries_limitations: string;
  medical_conditions: string;
  emergency_contact: string;
  preferred_days: string[];
  preferred_times: string[];
  preferred_location: string;
  coaching_style: string;
  communication_preference: string;
  notes: string;
};

const steps = [
  {
    key: "membership_agreement_signed",
    title: "Membership Agreement",
    description: "Review and accept the FORMED membership agreement.",
    actionLabel: "Accept Agreement",
  },
  {
    key: "liability_waiver_signed",
    title: "Liability Waiver",
    description: "Acknowledge the inherent risks of physical training.",
    actionLabel: "Accept Waiver",
  },
  {
    key: "auto_bill_authorized",
    title: "Billing Authorization",
    description: "Authorize automatic billing for your membership.",
    actionLabel: "Authorize Billing",
  },
  {
    key: "health_intake_completed",
    title: "Health Intake Form",
    description: "Tell us about your health history and fitness goals.",
    actionLabel: "Start Form",
  },
  {
    key: "payment_method_on_file",
    title: "Payment Method",
    description: "Add a payment method to your account.",
    actionLabel: "Add Card",
  },
];

// Document Viewer Modal Component
function DocumentViewer({ 
  title, 
  content, 
  onAccept, 
  onClose, 
  isOpen 
}: { 
  title: string; 
  content: string; 
  onAccept: () => void; 
  onClose: () => void; 
  isOpen: boolean;
}) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [legalName, setLegalName] = useState("");

  if (!isOpen) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    if (bottom) setHasScrolledToBottom(true);
  };

  const canAccept = hasScrolledToBottom && checkboxChecked && legalName.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] flex flex-col rounded-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">×</button>
        </div>
        <div 
          className="flex-1 overflow-y-auto p-6 text-sm font-body leading-relaxed space-y-4"
          onScroll={handleScroll}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        <div className="p-4 border-t space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
              className="w-4 h-4"
            />
            <span>I have read and agree to the {title}</span>
          </label>
          <input
            type="text"
            placeholder="Type your full legal name"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            className="w-full border border-stone p-2 text-sm font-body"
          />
          <button
            onClick={onAccept}
            disabled={!canAccept}
            className="w-full bg-ink text-cream text-xs tracking-widest uppercase font-body py-3 hover:bg-accent transition-colors disabled:opacity-50"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// Health Intake Form Component
function HealthIntakeForm({ 
  onSubmit, 
  initialData,
  onCancel 
}: { 
  onSubmit: (data: HealthIntakeData) => void; 
  initialData?: HealthIntakeData;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<HealthIntakeData>(initialData || {
    primary_goals: [],
    fitness_level: "",
    training_history: "",
    injuries_limitations: "",
    medical_conditions: "",
    emergency_contact: "",
    preferred_days: [],
    preferred_times: [],
    preferred_location: "",
    coaching_style: "",
    communication_preference: "",
    notes: "",
  });

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      primary_goals: prev.primary_goals.includes(goal)
        ? prev.primary_goals.filter(g => g !== goal)
        : [...prev.primary_goals, goal]
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_days: prev.preferred_days.includes(day)
        ? prev.preferred_days.filter(d => d !== day)
        : [...prev.preferred_days, day]
    }));
  };

  const handleTimeToggle = (time: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_times: prev.preferred_times.includes(time)
        ? prev.preferred_times.filter(t => t !== time)
        : [...prev.preferred_times, time]
    }));
  };

  const handleSubmit = () => {
    if (!formData.primary_goals.length || !formData.fitness_level || !formData.emergency_contact) {
      alert("Please fill in all required fields (goals, fitness level, emergency contact)");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-warm/10 p-4 text-center text-sm font-body">
        Your responses help your trainer personalize your program safely and effectively.
      </div>

      {/* Primary Goals */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Primary Goals *</label>
        <div className="flex flex-wrap gap-2">
          {["weight loss", "strength", "mobility", "general fitness"].map(goal => (
            <button
              key={goal}
              onClick={() => handleGoalToggle(goal)}
              className={cn(
                "px-3 py-1.5 text-xs uppercase tracking-wide border transition-colors",
                formData.primary_goals.includes(goal) 
                  ? "bg-ink text-cream border-ink" 
                  : "border-stone text-muted hover:border-warm"
              )}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Fitness Level */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Current Fitness Level *</label>
        <select 
          value={formData.fitness_level}
          onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value })}
          className="w-full border border-stone p-2 text-sm font-body"
        >
          <option value="">Select...</option>
          <option value="beginner">Beginner (new to exercise)</option>
          <option value="intermediate">Intermediate (exercise 1-3x/week)</option>
          <option value="advanced">Advanced (exercise 4+ times/week)</option>
          <option value="athlete">Athlete (competitive training)</option>
        </select>
      </div>

      {/* Training History */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Training History</label>
        <textarea 
          value={formData.training_history}
          onChange={(e) => setFormData({ ...formData, training_history: e.target.value })}
          rows={2}
          className="w-full border border-stone p-2 text-sm font-body"
          placeholder="Have you worked with a trainer before? What's your exercise background?"
        />
      </div>

      {/* Injuries/Limitations */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Injuries / Limitations</label>
        <textarea 
          value={formData.injuries_limitations}
          onChange={(e) => setFormData({ ...formData, injuries_limitations: e.target.value })}
          rows={2}
          className="w-full border border-stone p-2 text-sm font-body"
          placeholder="Any past or current injuries we should know about?"
        />
      </div>

      {/* Medical Conditions */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Medical Conditions / Medications</label>
        <textarea 
          value={formData.medical_conditions}
          onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
          rows={2}
          className="w-full border border-stone p-2 text-sm font-body"
          placeholder="Conditions or medications that may affect exercise"
        />
      </div>

      {/* Emergency Contact */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Emergency Contact *</label>
        <input 
          type="text"
          value={formData.emergency_contact}
          onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
          placeholder="Name and phone number"
          className="w-full border border-stone p-2 text-sm font-body"
        />
      </div>

      {/* Preferred Days */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Preferred Training Days</label>
        <div className="flex flex-wrap gap-2">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
            <button
              key={day}
              onClick={() => handleDayToggle(day)}
              className={cn(
                "px-3 py-1.5 text-xs uppercase tracking-wide border transition-colors",
                formData.preferred_days.includes(day) 
                  ? "bg-ink text-cream border-ink" 
                  : "border-stone text-muted hover:border-warm"
              )}
            >
              {day.slice(0,3)}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Times */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Preferred Training Times</label>
        <div className="flex flex-wrap gap-2">
          {["morning (6-9am)", "midday (9am-12pm)", "afternoon (12-3pm)", "evening (3-6pm)", "late (6-9pm)"].map(time => (
            <button
              key={time}
              onClick={() => handleTimeToggle(time)}
              className={cn(
                "px-3 py-1.5 text-xs uppercase tracking-wide border transition-colors",
                formData.preferred_times.includes(time) 
                  ? "bg-ink text-cream border-ink" 
                  : "border-stone text-muted hover:border-warm"
              )}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Location */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Preferred Location</label>
        <select 
          value={formData.preferred_location}
          onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
          className="w-full border border-stone p-2 text-sm font-body"
        >
          <option value="">Select...</option>
          <option value="home">Home</option>
          <option value="condo_gym">Condo Gym</option>
          <option value="office">Office</option>
        </select>
      </div>

      {/* Coaching Style */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Coaching Style Preference</label>
        <div className="flex flex-wrap gap-2">
          {["gentle", "moderate", "push me"].map(style => (
            <button
              key={style}
              onClick={() => setFormData({ ...formData, coaching_style: style })}
              className={cn(
                "px-3 py-1.5 text-xs uppercase tracking-wide border transition-colors",
                formData.coaching_style === style 
                  ? "bg-ink text-cream border-ink" 
                  : "border-stone text-muted hover:border-warm"
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Communication Preference */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Communication Preference</label>
        <select 
          value={formData.communication_preference}
          onChange={(e) => setFormData({ ...formData, communication_preference: e.target.value })}
          className="w-full border border-stone p-2 text-sm font-body"
        >
          <option value="">Select...</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="portal">Portal only</option>
        </select>
      </div>

      {/* Optional Notes */}
      <div>
        <label className="font-body text-sm font-medium block mb-2">Additional Notes (Optional)</label>
        <textarea 
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full border border-stone p-2 text-sm font-body"
          placeholder="Anything else you'd like your trainer to know?"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-ink text-cream text-xs tracking-widest uppercase font-body py-3 hover:bg-accent transition-colors"
        >
          Submit Health Intake
        </button>
        <button
          onClick={onCancel}
          className="px-6 border border-stone text-xs uppercase tracking-widest font-body hover:bg-stone/10"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const supabase = createClient();
const router = useRouter();

  const [onboarding, setOnboarding] = useState<OnboardingStatus>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [showStripe, setShowStripe] = useState(false);
  
  // Modal states
  const [activeDocument, setActiveDocument] = useState<{ key: string; title: string; content: string } | null>(null);
  const [showHealthForm, setShowHealthForm] = useState(false);

  const documentContents: Record<string, string> = {
    membership_agreement_signed: `
      <h3>FORMED Membership Agreement</h3>
      <p>Last updated: ${new Date().toLocaleDateString()}</p>
      <p>This Membership Agreement ("Agreement") is entered into between FORMED ("Company", "we", "us") and you ("Member", "Client").</p>
      <h4>1. Membership Services</h4>
      <p>FORMED provides personalized fitness training services including but not limited to: one-on-one training sessions, program design, progress tracking, and nutritional guidance as outlined in your selected membership plan.</p>
      <h4>2. Fees and Billing</h4>
      <p>Membership fees are billed on a recurring basis according to your selected plan. Fees are non-refundable except as required by law. FORMED reserves the right to change fees with 30 days' notice.</p>
      <h4>3. Cancellation Policy</h4>
      <p>You may cancel your membership at any time through your client portal. Cancellations require 30 days' notice for monthly memberships. No refunds for partial months.</p>
      <h4>4. Code of Conduct</h4>
      <p>Clients are expected to treat trainers and staff with respect. Harassment, discrimination, or unsafe behavior may result in immediate termination of membership without refund.</p>
      <h4>5. Assumption of Risk</h4>
      <p>You acknowledge that physical training involves inherent risks including injury. You agree to follow trainer instructions and disclose any health conditions that may affect your ability to exercise safely.</p>
    `,
    liability_waiver_signed: `
      <h3>FORMED Liability Waiver</h3>
      <p>I, the undersigned, acknowledge and agree to the following:</p>
      <h4>Assumption of Risk</h4>
      <p>I understand that fitness training and exercise activities involve inherent risks including but not limited to: muscle strains, fractures, cardiovascular events, and in rare cases, death. I voluntarily assume all risks associated with my participation in FORMED training programs.</p>
      <h4>Release of Liability</h4>
      <p>To the fullest extent permitted by law, I release FORMED, its owners, employees, trainers, and affiliates from any and all claims, damages, or injuries arising from my participation in training activities. This waiver applies even if injuries result from negligence.</p>
      <h4>Medical Clearance</h4>
      <p>I confirm that I have no known medical conditions that would prevent safe participation in physical exercise. I agree to consult with a physician if I am unsure about my fitness for training.</p>
      <h4>Photo/Video Consent</h4>
      <p>I consent to FORMED using photos or videos of my training sessions for promotional or educational purposes, with my identity protected unless otherwise agreed.</p>
      <p>By signing below, I acknowledge that I have read and fully understand this waiver.</p>
    `,
    auto_bill_authorized: `
      <h3>Billing Authorization Agreement</h3>
      <p>I authorize FORMED ("Company") to charge my designated payment method for:</p>
      <ul>
        <li>My selected membership plan recurring fees</li>
        <li>Any applicable late fees or service fees</li>
        <li>Cancellation fees under the no-show policy ($25 for missed sessions without 24-hour notice)</li>
        <li>Additional training sessions purchased outside my plan</li>
      </ul>
      <h4>Authorization Terms</h4>
      <p>This authorization will remain in effect until I cancel my membership or update my payment method in the client portal. I understand that it is my responsibility to maintain valid payment information. FORMED is not responsible for insufficient funds or declined charges.</p>
      <p>I agree to notify FORMED immediately of any billing disputes. Unauthorized charges will be investigated but are my responsibility until resolved.</p>
    `,
  };

  useEffect(() => {
    const load = async () => {
      const supabaseClient = createClient();
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data: client } = await supabaseClient
        .from("clients")
        .select("id, client_onboarding(*)")
        .eq("user_id", user.id)
        .single();

      if (client) {
        setClientId(client.id);
        const ob = Array.isArray(client.client_onboarding)
          ? client.client_onboarding[0]
          : client.client_onboarding;
        setOnboarding(ob ?? {});
      }
      setLoading(false);
    };
    load();
  }, []);

  const complete = (key: string) => !!onboarding[key];
  const completedCount = steps.filter(s => complete(s.key)).length;
  const allDone = completedCount === steps.length;

  const handleDocumentAccept = async () => {
    if (!clientId || !activeDocument) return;

    const key = activeDocument.key;
    setSaving(key);

    const update: Record<string, unknown> = {
      [key]: true,
      [`${key}_at`]: new Date().toISOString(),
    };

    const supabaseClient = createClient();
    const updatedOnboarding: OnboardingStatus = { ...onboarding, [key]: true };
    const allComplete = steps.every(s => updatedOnboarding[s.key]);
    if (allComplete) update.completed_at = new Date().toISOString();

    await supabaseClient
      .from("client_onboarding")
      .update(update)
      .eq("client_id", clientId);

    if (allComplete) {
      await supabaseClient
        .from("clients")
        .update({ status: "ready_for_match" })
        .eq("id", clientId);
    }

    setOnboarding(prev => ({ ...prev, [key]: true }));
    setSaving(null);
    setActiveDocument(null);
  };

  const handleHealthIntakeSubmit = async (data: HealthIntakeData) => {
    if (!clientId) return;

    setSaving("health_intake_completed");

    const supabaseClient = createClient();
    const update: Record<string, unknown> = {
      health_intake_completed: true,
      health_intake_completed_at: new Date().toISOString(),
      health_intake_data: data,
    };

    const updatedOnboarding: OnboardingStatus = { ...onboarding, health_intake_completed: true, health_intake_data: data };
    const allComplete = steps.every(s => updatedOnboarding[s.key]);
    if (allComplete) update.completed_at = new Date().toISOString();

    await supabaseClient
      .from("client_onboarding")
      .update(update)
      .eq("client_id", clientId);

    if (allComplete) {
      await supabaseClient
        .from("clients")
        .update({ status: "ready_for_match" })
        .eq("id", clientId);
    }

    setOnboarding(updatedOnboarding);
    setSaving(null);
    setShowHealthForm(false);
  };

  const handleAccept = async (key: string) => {
    if (!clientId) return;

    // Payment method handled separately via Stripe
    if (key === "payment_method_on_file") {
      setShowStripe(true);
      return;
    }

    // Health intake form
    if (key === "health_intake_completed") {
      setShowHealthForm(true);
      return;
    }

    // Document-based steps (membership_agreement, liability_waiver, auto_bill)
    if (documentContents[key]) {
      const step = steps.find(s => s.key === key);
      setActiveDocument({
        key,
        title: step?.title || "Agreement",
        content: documentContents[key],
      });
      return;
    }
  };

  const handleCardSuccess = async () => {
    setShowStripe(false);

    const updatedOnboarding: OnboardingStatus = { ...onboarding, payment_method_on_file: true };
    setOnboarding(updatedOnboarding);

    const allComplete = steps.every(s => updatedOnboarding[s.key]);
    if (allComplete && clientId) {
      const supabaseClient = createClient();
      await supabaseClient
        .from("client_onboarding")
        .update({ completed_at: new Date().toISOString() })
        .eq("client_id", clientId);

      await supabaseClient
        .from("clients")
        .update({ status: "ready_for_match" })
        .eq("id", clientId);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Document Modal */}
      {activeDocument && (
        <DocumentViewer
          title={activeDocument.title}
          content={activeDocument.content}
          onAccept={handleDocumentAccept}
          onClose={() => setActiveDocument(null)}
          isOpen={!!activeDocument}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-1">Setup</p>
        <h1 className="font-display text-3xl font-light text-ink mb-2">
          Complete Your Onboarding
        </h1>
        <p className="text-muted text-sm font-body leading-relaxed">
          Complete all 5 steps to get matched with your trainer.
        </p>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex-1 h-1 bg-stone">
            <div
              className="h-1 bg-ink transition-all duration-700"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-body text-muted flex-shrink-0">
            {completedCount} / {steps.length}
          </span>
        </div>
      </div>

      {/* All done */}
      {allDone && (
        <div className="bg-ink text-cream p-8 mb-8 text-center">
          <div className="w-12 h-12 bg-cream/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={20} className="text-cream" />
          </div>
          <p className="font-display text-2xl font-light mb-2">Onboarding complete!</p>
          <p className="text-cream/60 text-sm font-body mb-6">
            Your profile is ready for matching. Our team will be in touch within 24–48 hours.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-cream text-ink text-[10px] tracking-widest uppercase font-body px-8 py-3 hover:bg-stone transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const done = complete(step.key);
          const isSaving = saving === step.key;
          const isPayment = step.key === "payment_method_on_file";
          const isHealthForm = step.key === "health_intake_completed";

          return (
            <div key={step.key}
              className={cn(
                "border p-6 transition-all duration-200 bg-white",
                done ? "border-stone" : "border-stone hover:border-warm"
              )}>
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  done ? "bg-ink" : "border border-stone bg-cream"
                )}>
                  {done ? (
                    <Check size={13} className="text-cream" />
                  ) : (
                    <span className="text-muted text-xs font-body">{i + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className={cn(
                        "font-body text-sm font-medium",
                        done ? "text-muted line-through" : "text-ink"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-muted text-xs font-body mt-0.5">
                        {step.description}
                      </p>
                    </div>

                    {!done && !showStripe && !showHealthForm && (
                      <button
                        onClick={() => handleAccept(step.key)}
                        disabled={!!saving}
                        className="flex-shrink-0 bg-ink text-cream text-[10px] tracking-widest uppercase font-body px-5 py-2.5 hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : step.actionLabel}
                      </button>
                    )}
                  </div>

                  {/* Health Intake Form */}
                  {isHealthForm && showHealthForm && !done && clientId && (
                    <div className="mt-4">
                      <HealthIntakeForm
                        onSubmit={handleHealthIntakeSubmit}
                        initialData={onboarding.health_intake_data as HealthIntakeData}
                        onCancel={() => setShowHealthForm(false)}
                      />
                    </div>
                  )}

                  {/* Stripe card form inline */}
                  {isPayment && showStripe && !done && clientId && (
                    <div className="mt-4">
                      <PaymentSetup
                        clientId={clientId}
                        onSuccess={handleCardSuccess}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}