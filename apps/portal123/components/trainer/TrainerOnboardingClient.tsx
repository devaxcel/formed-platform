"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import { Check, BookOpen, FileText, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  trainerId: string;
  modules: any[];
  progress: any[];
}

export default function TrainerOnboardingClient({ trainerId, modules, progress }: Props) {
  const supabase = createClient();
  const router   = useRouter();
  const [completing, setCompleting] = useState<string | null>(null);
  const [localProgress, setLocalProgress] = useState(progress);

  const isComplete = (moduleId: string) =>
    localProgress.some(p => p.module_id === moduleId && p.completed);

  const completedCount = modules.filter(m => isComplete(m.id)).length;
  const allDone = completedCount === modules.length;

  const handleComplete = async (moduleId: string) => {
    setCompleting(moduleId);

    const existing = localProgress.find(p => p.module_id === moduleId);
    if (existing) {
      await supabase
        .from("trainer_module_progress")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("trainer_module_progress")
        .insert({
          trainer_id:  trainerId,
          module_id:   moduleId,
          completed:   true,
          completed_at: new Date().toISOString(),
        });
    }

    setLocalProgress(prev => {
      const filtered = prev.filter(p => p.module_id !== moduleId);
      return [...filtered, { module_id: moduleId, completed: true }];
    });

    setCompleting(null);
  };

  const typeIcon = (type: string) => {
    if (type === "video") return <BookOpen size={14} className="text-muted" />;
    if (type === "pdf")   return <FileText size={14} className="text-muted" />;
    return <HelpCircle size={14} className="text-muted" />;
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <SectionHeader
        title="Trainer Onboarding"
        subtitle="Complete all modules to become active on the platform"
      />

      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-1 bg-stone">
          <div
            className="h-1 bg-ink transition-all duration-700"
            style={{ width: modules.length > 0 ? `${(completedCount / modules.length) * 100}%` : "0%" }}
          />
        </div>
        <span className="text-xs font-body text-muted flex-shrink-0">
          {completedCount} / {modules.length} complete
        </span>
      </div>

      {allDone && (
        <div className="bg-ink p-6 text-center">
          <p className="font-display text-2xl font-light text-cream mb-2">
            Onboarding complete!
          </p>
          <p className="text-cream/50 text-sm font-body">
            Your application is now under review. The FORMED team will be in touch shortly.
          </p>
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
            const done = isComplete(module.id);
            return (
              <div key={module.id}
                className={cn(
                  "border p-6 transition-all",
                  done ? "bg-white border-stone" : "bg-white border-stone hover:border-warm"
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

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {typeIcon(module.module_type)}
                          <p className={cn(
                            "font-body text-sm font-medium",
                            done ? "text-muted line-through" : "text-ink"
                          )}>
                            {module.title}
                          </p>
                        </div>
                        {module.description && (
                          <p className="text-muted text-xs font-body leading-relaxed">
                            {module.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] tracking-widest uppercase text-muted font-body bg-stone px-2 py-0.5">
                            {module.module_type}
                          </span>
                          {module.is_required && (
                            <span className="text-[10px] tracking-widest uppercase text-ink font-body">
                              Required
                            </span>
                          )}
                        </div>
                      </div>

                      {!done && (
                        <button
                          onClick={() => handleComplete(module.id)}
                          disabled={completing === module.id}
                          className="flex-shrink-0 bg-ink text-cream text-[10px] tracking-widest uppercase font-body px-5 py-2.5 hover:bg-accent transition-colors disabled:opacity-50"
                        >
                          {completing === module.id ? "Saving..." : "Mark Complete"}
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
    </div>
  );
}