"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import { Check, FileText, X, Upload, ChevronDown, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  trainerId: string;
  modules: any[];
  progress: any[];
}

// ── PDF Viewer Modal ──────────────────────────────────────────────────────────

function PDFViewerModal({
  module,
  onClose,
  onAccept,
}: {
  module: any;
  onClose: () => void;
  onAccept: (fullName: string) => void;
}) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [acknowledged,     setAcknowledged]     = useState(false);
  const [fullName,         setFullName]         = useState("");
  const [saving,           setSaving]           = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom) setScrolledToBottom(true);
  };

  const canAccept = scrolledToBottom && acknowledged && fullName.trim().length > 2;

  const handleAccept = async () => {
    if (!canAccept) return;
    setSaving(true);
    await onAccept(fullName.trim());
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl my-8 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone flex-shrink-0">
          <div>
            <h2 className="font-display text-xl font-light text-ink">{module.title}</h2>
            <p className="text-[10px] tracking-widest uppercase text-muted font-body mt-0.5">
              Required — Read to bottom to complete
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {/* PDF / Document viewer */}
        <div
          className="flex-1 overflow-y-auto bg-stone/30 relative"
          style={{ height: "60vh" }}
          onScroll={handleScroll}
        >
          {module.content_url ? (
            <iframe
              src={module.content_url}
              className="w-full h-full border-0"
              title={module.title}
            />
          ) : (
            /* Fallback — scrollable text content */
            <div className="p-8 space-y-4">
              <p className="font-display text-2xl font-light text-ink mb-4">{module.title}</p>
              {module.description && (
                <p className="text-ink font-body text-sm leading-relaxed">{module.description}</p>
              )}
              {module.content ? (
                <div className="text-sm text-ink font-body leading-relaxed whitespace-pre-wrap">
                  {module.content}
                </div>
              ) : (
                <div className="space-y-3 text-sm text-ink font-body leading-relaxed">
                  <p>This module covers the policies and procedures required for all FORMED trainers.</p>
                  <p>Please review all sections carefully before acknowledging and completing this module.</p>
                  <p>By completing this module you confirm that you have read, understood, and agree to comply with all requirements outlined in this document.</p>
                  {/* Spacer to force scrolling */}
                  <div className="h-32" />
                  <p className="text-muted text-xs">— End of document —</p>
                </div>
              )}
            </div>
          )}

          {/* Scroll indicator — shown until scrolled */}
          {!scrolledToBottom && (
            <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent p-4 flex justify-center pointer-events-none">
              <div className="flex items-center gap-2 bg-white border border-stone px-4 py-2 shadow-sm">
                <ChevronDown size={14} className="text-muted animate-bounce" />
                <p className="text-[10px] tracking-widest uppercase text-muted font-body">
                  Scroll to bottom to continue
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Acknowledgment section — unlocks after scroll */}
        <div className={cn(
          "border-t border-stone p-6 space-y-4 flex-shrink-0 transition-opacity duration-300",
          !scrolledToBottom && "opacity-40 pointer-events-none"
        )}>
          {!scrolledToBottom && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5">
              <Lock size={13} />
              <p className="text-xs font-body">Scroll through the document above to unlock</p>
            </div>
          )}

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-ink"
            />
            <span className="text-sm font-body text-ink leading-relaxed">
              I confirm that I have read and understood the contents of this module and agree to comply with all requirements outlined above.
            </span>
          </label>

          {/* Full name */}
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2 font-body">
              Type Your Full Legal Name to Sign
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full border border-stone p-3 text-sm font-body focus:outline-none focus:border-ink"
            />
          </div>

          {/* Timestamp notice */}
          <p className="text-[10px] text-muted font-body">
            Completion will be timestamped: {new Date().toLocaleString("en-US", {
              timeZone: "America/New_York",
              dateStyle: "medium",
              timeStyle: "short",
            })} ET
          </p>

          <button
            onClick={handleAccept}
            disabled={!canAccept || saving}
            className="w-full bg-ink text-cream text-[10px] tracking-widests uppercase font-body py-4 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Accept & Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Document Upload Section ───────────────────────────────────────────────────

function DocUploadSection({
  trainerId,
  onAllUploaded,
}: {
  trainerId: string;
  onAllUploaded: () => void;
}) {
  const supabase = createClient();

  const REQUIRED_DOCS = [
    { key: "drivers_license",    label: "Driver's License",        required: true  },
    { key: "cpt_certification",  label: "CPT Certification",       required: true  },
    { key: "cpr_aed",            label: "CPR/AED Certification",   required: true  },
    { key: "insurance",          label: "Insurance Certificate",   required: false },
  ];

  const [uploads,  setUploads]  = useState<Record<string, { file: File; url: string } | null>>({});
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState("");

  const handleFile = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploads(prev => ({ ...prev, [key]: { file, url: URL.createObjectURL(file) } }));
  };

  const requiredDone = REQUIRED_DOCS.filter(d => d.required).every(d => uploads[d.key]);

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      for (const doc of REQUIRED_DOCS) {
        const upload = uploads[doc.key];
        if (!upload) continue;
        const ext  = upload.file.name.split(".").pop();
        const path = `trainer-docs/${trainerId}/${doc.key}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("trainer-docs")
          .upload(path, upload.file, { upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("trainer-docs").getPublicUrl(path);
        await supabase.from("trainer_docs").upsert({
          trainer_id:      trainerId,
          doc_type:        doc.key,
          file_url:        publicUrl,
          approval_status: "pending",
          uploaded_at:     new Date().toISOString(),
        }, { onConflict: "trainer_id,doc_type" });
      }
      // Lock trainer in pending_approval
      await supabase.from("trainers")
        .update({ status: "approved_pending_docs" })
        .eq("id", trainerId);
      setDone(true);
      onAllUploaded();
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    }
    setSaving(false);
  };

  if (done) {
    return (
      <div className="bg-ink p-8 text-center">
        <Check size={28} className="text-cream mx-auto mb-3" />
        <p className="font-display text-2xl font-light text-cream mb-2">Documents Submitted</p>
        <p className="text-cream/60 text-sm font-body leading-relaxed max-w-sm mx-auto">
          Your documents are under review. The FORMED team will notify you once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone p-6 space-y-5">
      <div>
        <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-1">
          Final Step
        </p>
        <h3 className="font-display text-2xl font-light text-ink mb-1">Upload Your Documents</h3>
        <p className="text-sm text-muted font-body leading-relaxed">
          Upload the required documents below. Your account will be locked for admin review until all required docs are approved.
        </p>
      </div>

      <div className="space-y-3">
        {REQUIRED_DOCS.map(doc => {
          const uploaded = uploads[doc.key];
          return (
            <div key={doc.key} className="border border-stone p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-body font-medium text-ink">{doc.label}</p>
                <p className="text-[10px] text-muted font-body">
                  {doc.required ? "Required" : "Optional at launch"}
                  {uploaded && ` · ${uploaded.file.name}`}
                </p>
              </div>
              <label className="cursor-pointer">
                <div className={cn(
                  "flex items-center gap-2 text-[10px] tracking-widests uppercase font-body px-4 py-2 transition-colors",
                  uploaded
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-ink text-cream hover:bg-accent"
                )}>
                  {uploaded ? <Check size={11} /> : <Upload size={11} />}
                  {uploaded ? "Uploaded" : "Upload"}
                </div>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFile(doc.key)} />
              </label>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle size={14} />
          <p className="text-xs font-body">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!requiredDone || saving}
        className="w-full bg-ink text-cream text-[10px] tracking-widests uppercase font-body py-4 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
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

  const isComplete = (moduleId: string) =>
    localProgress.some(p => p.module_id === moduleId && p.completed);

  const completedCount = modules.filter(m => isComplete(m.id)).length;
  const allModulesDone = completedCount === modules.length && modules.length > 0;

  const handleAccept = async (moduleId: string, fullName: string) => {
    const now = new Date().toISOString();
    const existing = localProgress.find(p => p.module_id === moduleId);

    if (existing) {
      await supabase.from("trainer_module_progress").update({
        completed:      true,
        completed_at:   now,
        signature_name: fullName,
      }).eq("id", existing.id);
    } else {
      await supabase.from("trainer_module_progress").insert({
        trainer_id:     trainerId,
        module_id:      moduleId,
        completed:      true,
        completed_at:   now,
        signature_name: fullName,
      });
    }

    setLocalProgress(prev => {
      const filtered = prev.filter(p => p.module_id !== moduleId);
      return [...filtered, { module_id: moduleId, completed: true, completed_at: now, signature_name: fullName }];
    });

    setActiveModule(null);

    // After all modules done — show doc upload
    const newCount = modules.filter(m =>
      m.id === moduleId ? true : isComplete(m.id)
    ).length;
    if (newCount === modules.length) {
      setTimeout(() => setShowDocUpload(true), 600);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">

      {/* PDF Viewer Modal */}
      {activeModule && (
        <PDFViewerModal
          module={activeModule}
          onClose={() => setActiveModule(null)}
          onAccept={(fullName) => handleAccept(activeModule.id, fullName)}
        />
      )}

      <SectionHeader
        title="Trainer Onboarding"
        subtitle="Complete all modules to become active on the platform"
      />

      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-1.5 bg-stone">
          <div
            className="h-1.5 bg-ink transition-all duration-700"
            style={{ width: modules.length > 0 ? `${(completedCount / modules.length) * 100}%` : "0%" }}
          />
        </div>
        <span className="text-xs font-body text-muted flex-shrink-0">
          {completedCount} / {modules.length} complete
        </span>
      </div>

      {/* All modules done — show doc upload */}
      {allModulesDone && (
        <div className="bg-green-50 border border-green-200 p-5 flex items-start gap-3">
          <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-body font-medium text-green-800 text-sm mb-0.5">
              All modules completed!
            </p>
            <p className="text-green-700 text-xs font-body leading-relaxed">
              Now upload your required documents below to complete your application.
            </p>
          </div>
        </div>
      )}

      {/* Modules list */}
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
              <div
                key={module.id}
                className={cn(
                  "border transition-all",
                  done
                    ? "bg-white border-stone"
                    : "bg-white border-stone hover:border-warm cursor-pointer"
                )}
              >
                <div className="flex items-start gap-4 p-5">
                  {/* Step number / check */}
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

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText size={13} className="text-muted" />
                          <p className={cn(
                            "font-body text-sm font-medium",
                            done ? "text-muted" : "text-ink"
                          )}>
                            {module.title}
                          </p>
                        </div>
                        {module.description && (
                          <p className="text-muted text-xs font-body leading-relaxed mb-2">
                            {module.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] tracking-widests uppercase text-muted font-body bg-stone px-2 py-0.5">
                            PDF Document
                          </span>
                          {module.is_required && (
                            <span className="text-[10px] tracking-widests uppercase text-ink font-body">
                              Required
                            </span>
                          )}
                        </div>
                        {/* Completion info */}
                        {done && progEntry?.completed_at && (
                          <p className="text-[10px] text-muted font-body mt-2">
                            ✓ Completed {new Date(progEntry.completed_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                            {progEntry.signature_name && ` · Signed by ${progEntry.signature_name}`}
                          </p>
                        )}
                      </div>

                      {/* Action button */}
                      {done ? (
                        <span className="text-[10px] tracking-widests uppercase font-body text-green-600 bg-green-50 px-3 py-1.5 border border-green-200 flex-shrink-0">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveModule(module)}
                          className="flex items-center gap-2 bg-ink text-cream text-[10px] tracking-widests uppercase font-body px-4 py-2.5 hover:bg-accent transition-colors flex-shrink-0"
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

      {/* Document upload — shown after all modules done */}
      {(allModulesDone || showDocUpload) && (
        <DocUploadSection
          trainerId={trainerId}
          onAllUploaded={() => router.refresh()}
        />
      )}
    </div>
  );
}
