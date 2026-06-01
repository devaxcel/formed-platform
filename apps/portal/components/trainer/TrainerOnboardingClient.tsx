"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import { Check, FileText, X, Upload, Lock, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  trainerId: string;
  modules: any[];
  progress: any[];
}

// ── PDF Viewer Modal ──────────────────────────────────────────────────────────

function PDFViewerModal({ module, onClose, onAccept }: {
  module: any;
  onClose: () => void;
  onAccept: (fullName: string) => Promise<void>;
}) {
  const scrollRef            = useRef<HTMLDivElement>(null);
  const [scrolledToBottom,   setScrolledToBottom]   = useState(false);
  const [acknowledged,       setAcknowledged]       = useState(false);
  const [fullName,           setFullName]           = useState("");
  const [saving,             setSaving]             = useState(false);

  // Check scroll position
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    if (atBottom) setScrolledToBottom(true);
  };

  // Also check on mount in case content is short
  useEffect(() => {
    handleScroll();
  }, []);

  const canAccept = scrolledToBottom && acknowledged && fullName.trim().length > 2;

  const handleAccept = async () => {
    if (!canAccept) return;
    setSaving(true);
    await onAccept(fullName.trim());
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl flex flex-col rounded-none shadow-2xl"
        style={{ height: "90vh", maxHeight: "800px" }}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone flex-shrink-0">
          <div>
            <h2 className="font-display text-lg font-light text-ink">{module.title}</h2>
            <p className="text-[10px] tracking-widest uppercase text-muted font-body">
              Required — Scroll to bottom to complete
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable document area — THIS is the scroll container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-cream/30 px-8 py-6"
        >
          <h3 className="font-display text-2xl font-light text-ink mb-4">{module.title}</h3>

          {module.description && (
            <p className="text-ink font-body text-sm leading-relaxed mb-4">{module.description}</p>
          )}

          {module.content ? (
            <div className="text-sm text-ink font-body leading-relaxed whitespace-pre-wrap">
              {module.content}
            </div>
          ) : (
            <div className="space-y-4 text-sm text-ink font-body leading-relaxed">
              <p>This module covers the policies and procedures required for all FORMED trainers.</p>
              <p>Please review all sections carefully before acknowledging and completing this module.</p>
              <p>As a FORMED trainer, you are expected to uphold the highest standards of professionalism, client care, and platform compliance.</p>
              <p>Your commitment to these standards ensures a premium experience for every FORMED client and reflects the quality of service we deliver as a brand.</p>
              <p>Failure to comply with the requirements outlined in this and other onboarding modules may result in restriction or removal from the platform.</p>
              <p>By completing this module you confirm that you have read, understood, and agree to comply with all requirements outlined in this document.</p>
              <div className="h-8" />
              <p className="text-muted text-xs text-center border-t border-stone pt-4">— End of document —</p>
            </div>
          )}
        </div>

        {/* Scroll indicator — shown until scrolled to bottom */}
        {!scrolledToBottom && (
          <div className="flex-shrink-0 bg-white border-t border-stone px-6 py-3 flex items-center justify-center gap-2">
            <ChevronDown size={14} className="text-warm animate-bounce" />
            <p className="text-[10px] tracking-widest uppercase text-muted font-body">
              Scroll to bottom to unlock
            </p>
          </div>
        )}

        {/* Acknowledgment section — locked until scrolled */}
        <div className={cn(
          "flex-shrink-0 border-t border-stone px-6 py-5 space-y-4 bg-white transition-opacity duration-300",
          !scrolledToBottom ? "opacity-40 pointer-events-none" : "opacity-100"
        )}>
          {!scrolledToBottom && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5">
              <Lock size={12} className="text-amber-600" />
              <p className="text-xs font-body text-amber-700">Scroll through the document above to unlock</p>
            </div>
          )}

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-ink flex-shrink-0"
            />
            <span className="text-sm font-body text-ink leading-relaxed">
              I confirm that I have read and understood the contents of this module and agree to comply with all requirements.
            </span>
          </label>

          {/* Signature */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-1.5 font-body">
              Type Your Full Legal Name to Sign
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full border border-stone p-2.5 text-sm font-body focus:outline-none focus:border-ink"
            />
          </div>

          {/* Timestamp */}
          <p className="text-[10px] text-muted font-body">
            Timestamp: {new Date().toLocaleString("en-US", {
              timeZone: "America/New_York",
              dateStyle: "medium",
              timeStyle: "short",
            })} ET
          </p>

          <button
            onClick={handleAccept}
            disabled={!canAccept || saving}
            className="w-full bg-ink text-cream text-[10px] tracking-widest uppercase font-body py-3.5 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Accept & Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Document Upload Section ───────────────────────────────────────────────────

function DocUploadSection({ trainerId, onAllUploaded }: {
  trainerId: string;
  onAllUploaded: () => void;
}) {
  const supabase = createClient();
  const DOCS = [
    { key: "drivers_license",   label: "Driver's License",      required: true  },
    { key: "cpt_certification", label: "CPT Certification",     required: true  },
    { key: "cpr_aed",           label: "CPR/AED Certification", required: true  },
    { key: "insurance",         label: "Insurance Certificate", required: false },
  ];
  const [uploads, setUploads] = useState<Record<string, File>>({});
  const [saving,  setSaving]  = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const requiredDone = DOCS.filter(d => d.required).every(d => uploads[d.key]);

  const handleFile = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploads(prev => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      for (const doc of DOCS) {
        const file = uploads[doc.key];
        if (!file) continue;
        const ext  = file.name.split(".").pop();
        const path = `trainer-docs/${trainerId}/${doc.key}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("trainer-docs").upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("trainer-docs").getPublicUrl(path);
        await supabase.from("trainer_docs").upsert({
          trainer_id: trainerId, doc_type: doc.key,
          file_url: publicUrl, approval_status: "pending",
          upload_date: new Date().toISOString(),
        }, { onConflict: "trainer_id,doc_type" });
      }
      await supabase.from("trainers")
        .update({ status: "approved_pending_docs" }).eq("id", trainerId);
      setDone(true);
      onAllUploaded();
    } catch (err: any) {
      setError(err.message ?? "Upload failed. Please try again.");
    }
    setSaving(false);
  };

  if (done) {
    return (
      <div className="bg-ink p-8 text-center">
        <Check size={28} className="text-cream mx-auto mb-3" />
        <p className="font-display text-2xl font-light text-cream mb-2">Documents Submitted</p>
        <p className="text-cream/60 text-sm font-body">
          Your documents are under review. FORMED will notify you once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-ink p-6 space-y-5">
      <div>
        <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-1">Final Step</p>
        <h3 className="font-display text-2xl font-light text-ink mb-1">Upload Your Documents</h3>
        <p className="text-sm text-muted font-body leading-relaxed">
          Upload the required documents. Your account will be locked for admin review until all docs are approved.
        </p>
      </div>
      <div className="space-y-3">
        {DOCS.map(doc => (
          <div key={doc.key} className="border border-stone p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-body font-medium text-ink">{doc.label}</p>
              <p className="text-[10px] text-muted font-body">
                {doc.required ? "Required" : "Optional"}{uploads[doc.key] ? ` · ${uploads[doc.key].name}` : ""}
              </p>
            </div>
            <label className="cursor-pointer">
              <div className={cn(
                "flex items-center gap-2 text-[10px] tracking-widest uppercase font-body px-4 py-2 transition-colors",
                uploads[doc.key]
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-ink text-cream hover:bg-accent"
              )}>
                {uploads[doc.key] ? <Check size={11} /> : <Upload size={11} />}
                {uploads[doc.key] ? "Uploaded" : "Choose File"}
              </div>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFile(doc.key)} />
            </label>
          </div>
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle size={14} />
          <p className="text-xs font-body">{error}</p>
        </div>
      )}
      <button onClick={handleSubmit} disabled={!requiredDone || saving}
        className="w-full bg-ink text-cream text-[10px] tracking-widest uppercase font-body py-4 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        {saving ? "Uploading..." : "Submit Documents for Review"}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TrainerOnboardingClient({ trainerId, modules, progress }: Props) {
  const supabase = createClient();
  const router   = useRouter();

  const [localProgress, setLocalProgress] = useState(progress);
  const [activeModule,  setActiveModule]  = useState<any | null>(null);
  const [showDocUpload, setShowDocUpload] = useState(false);

  const isComplete     = (moduleId: string) =>
    localProgress.some(p => p.module_id === moduleId && p.completed);
  const completedCount = modules.filter(m => isComplete(m.id)).length;
  const allModulesDone = modules.length > 0 && completedCount === modules.length;

  const handleAccept = async (moduleId: string, fullName: string) => {
    const now      = new Date().toISOString();
    const existing = localProgress.find(p => p.module_id === moduleId);
    if (existing) {
      await supabase.from("trainer_module_progress").update({
        completed: true, completed_at: now, signature_name: fullName,
      }).eq("id", existing.id);
    } else {
      await supabase.from("trainer_module_progress").insert({
        trainer_id: trainerId, module_id: moduleId,
        completed: true, completed_at: now, signature_name: fullName,
      });
    }
    const updated = [
      ...localProgress.filter(p => p.module_id !== moduleId),
      { module_id: moduleId, completed: true, completed_at: now, signature_name: fullName },
    ];
    setLocalProgress(updated);
    setActiveModule(null);
    const newCount = modules.filter(m => updated.some(p => p.module_id === m.id && p.completed)).length;
    if (newCount === modules.length) setTimeout(() => setShowDocUpload(true), 400);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">

      {activeModule && (
        <PDFViewerModal
          module={activeModule}
          onClose={() => setActiveModule(null)}
          onAccept={(name) => handleAccept(activeModule.id, name)}
        />
      )}

      <SectionHeader
        title="Trainer Onboarding"
        subtitle="Complete all modules to become active on the platform"
      />

      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-1.5 bg-stone">
          <div className="h-1.5 bg-ink transition-all duration-700"
            style={{ width: modules.length > 0 ? `${(completedCount / modules.length) * 100}%` : "0%" }} />
        </div>
        <span className="text-xs font-body text-muted flex-shrink-0">
          {completedCount} / {modules.length} complete
        </span>
      </div>

      {allModulesDone && (
        <div className="bg-green-50 border border-green-200 p-5 flex items-start gap-3">
          <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-body font-medium text-green-800 text-sm mb-0.5">All modules completed!</p>
            <p className="text-green-700 text-xs font-body">Now upload your required documents below.</p>
          </div>
        </div>
      )}

      {modules.length === 0 ? (
        <Card>
          <p className="text-center text-muted text-sm font-body py-8">
            Onboarding modules will appear here once the FORMED team sets them up.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {modules.map((module, i) => {
            const done      = isComplete(module.id);
            const progEntry = localProgress.find(p => p.module_id === module.id);
            return (
              <div key={module.id} className="bg-white border border-stone hover:border-warm transition-all">
                <div className="flex items-start gap-4 p-5">
                  {/* Step circle */}
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    done ? "bg-ink" : "border border-stone bg-cream"
                  )}>
                    {done
                      ? <Check size={13} className="text-cream" />
                      : <span className="text-muted text-xs font-body">{i + 1}</span>}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText size={13} className="text-muted" />
                          <p className={cn("font-body text-sm font-medium", done ? "text-muted" : "text-ink")}>
                            {module.title}
                          </p>
                        </div>
                        {module.description && (
                          <p className="text-muted text-xs font-body leading-relaxed mb-2">
                            {module.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] tracking-widest uppercase text-muted font-body bg-stone px-2 py-0.5">
                            PDF Document
                          </span>
                          {module.is_required && (
                            <span className="text-[10px] tracking-widest uppercase text-ink font-body">Required</span>
                          )}
                        </div>
                        {done && progEntry?.completed_at && (
                          <p className="text-[10px] text-green-600 font-body mt-2">
                            ✓ Completed {new Date(progEntry.completed_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                            {progEntry.signature_name && ` · Signed by ${progEntry.signature_name}`}
                          </p>
                        )}
                      </div>

                      {done ? (
                        <span className="text-[10px] tracking-widest uppercase font-body text-green-600 bg-green-50 px-3 py-1.5 border border-green-200 flex-shrink-0">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveModule(module)}
                          className="flex items-center gap-2 bg-ink text-cream text-[10px] tracking-widest uppercase font-body px-4 py-2.5 hover:bg-accent transition-colors flex-shrink-0"
                        >
                          <FileText size={11} /> Open & Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(allModulesDone || showDocUpload) && (
        <DocUploadSection trainerId={trainerId} onAllUploaded={() => router.refresh()} />
      )}
    </div>
  );
}
