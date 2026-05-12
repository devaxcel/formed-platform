import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import EmptyState from "@/components/portal/ui/EmptyState";
import Link from "next/link";
import { ClipboardList, CheckCircle } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default async function TrainerNotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: trainer } = await supabase
    .from("trainers").select("id").eq("user_id", user.id).single();

  // Sessions needing notes
  const { data: pending } = await supabase
    .from("sessions")
    .select(`*, clients(full_name)`)
    .eq("trainer_id", trainer?.id ?? "")
    .eq("booking_status", "completed")
    .eq("notes_submitted", false)
    .order("date_time", { ascending: false });

  // Recent submitted notes
  const { data: submitted } = await supabase
    .from("sessions")
    .select(`*, clients(full_name), session_notes(*)`)
    .eq("trainer_id", trainer?.id ?? "")
    .eq("notes_submitted", true)
    .order("date_time", { ascending: false })
    .limit(10);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <SectionHeader title="Session Notes" />

      {/* Pending notes */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
          Awaiting Notes ({pending?.length ?? 0})
        </p>
        {pending && pending.length > 0 ? (
          <div className="space-y-2">
            {pending.map((s) => {
              const sessionDate = new Date(s.date_time);
              const now = new Date();
              const hoursAgo = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60);
              const isLate = hoursAgo > 12;

              return (
                <Card key={s.id} className={isLate ? "border-l-2 border-l-red-300" : ""}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-body font-medium text-ink text-sm">
                          {s.clients?.full_name}
                        </p>
                        {isLate && (
                          <span className="text-[10px] tracking-widest uppercase font-body text-red-500 bg-red-50 px-2 py-0.5">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-muted text-xs font-body">
                        {formatDate(s.date_time)} at {formatTime(s.date_time)}
                      </p>
                    </div>
                    <Link href={`/trainer/notes/${s.id}`}
                      className="bg-ink text-cream text-[10px] tracking-widest uppercase font-body px-5 py-2.5 hover:bg-accent transition-colors flex-shrink-0">
                      Submit Notes
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<CheckCircle size={28} />}
              title="All notes submitted"
              description="No sessions are waiting for notes."
            />
          </Card>
        )}
      </div>

      {/* Submitted notes */}
      {submitted && submitted.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
            Submitted Notes
          </p>
          <div className="space-y-2">
            {submitted.map((s) => (
              <Card key={s.id} padding="sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-body font-medium text-ink text-sm mb-0.5">
                      {s.clients?.full_name}
                    </p>
                    <p className="text-muted text-xs font-body mb-3">
                      {formatDate(s.date_time)}
                    </p>
                    {s.session_notes?.[0] && (
                      <div className="grid grid-cols-2 gap-3">
                        {s.session_notes[0].exercises_completed && (
                          <div>
                            <p className="text-[10px] text-muted font-body uppercase tracking-widest mb-1">Exercises</p>
                            <p className="text-xs text-ink font-body leading-relaxed line-clamp-2">
                              {s.session_notes[0].exercises_completed}
                            </p>
                          </div>
                        )}
                        {s.session_notes[0].wins_improvements && (
                          <div>
                            <p className="text-[10px] text-muted font-body uppercase tracking-widest mb-1">Wins</p>
                            <p className="text-xs text-ink font-body leading-relaxed line-clamp-2">
                              {s.session_notes[0].wins_improvements}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-1" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}