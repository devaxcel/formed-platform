import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SessionNoteForm from "@/components/trainer/SessionNoteForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";

// Fix: Add Promise type and make params async
export default async function SubmitNotePage({ 
  params 
}: { 
  params: Promise<{ sessionId: string }> 
}) {
  // Fix: Await the params
  const { sessionId } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: trainer } = await supabase
    .from("trainers").select("id").eq("user_id", user.id).single();

  const { data: session } = await supabase
    .from("sessions")
    .select(`*, clients(full_name, city), session_notes(*)`)
    .eq("id", sessionId)  // Fix: Use sessionId variable
    .single();

  if (!session || session.trainer_id !== trainer?.id) redirect("/trainer/notes");

  const alreadySubmitted = session.session_notes?.length > 0;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <Link href="/trainer/notes"
        className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body transition-colors">
        <ArrowLeft size={12} /> Back to Notes
      </Link>

      <div>
        <p className="text-[10px] tracking-widest uppercase text-muted mb-1 font-body">Session Notes</p>
        <h1 className="font-display text-3xl font-light text-ink mb-1">
          {session.clients?.full_name}
        </h1>
        <p className="text-muted text-sm font-body">
          {formatDate(session.date_time)} at {formatTime(session.date_time)}
        </p>
      </div>

      {alreadySubmitted ? (
        <div className="bg-green-50 border border-green-200 p-6">
          <p className="font-body font-medium text-green-800 mb-2">Notes already submitted</p>
          <div className="space-y-3 mt-4">
            {[
              { label: "Exercises", value: session.session_notes[0].exercises_completed },
              { label: "Intensity (RPE)", value: session.session_notes[0].intensity_rpe },
              { label: "Wins", value: session.session_notes[0].wins_improvements },
              { label: "Limitations", value: session.session_notes[0].limitations_pain },
              { label: "Homework", value: session.session_notes[0].homework_habits },
              { label: "Next Focus", value: session.session_notes[0].next_session_focus },
            ].map(f => f.value ? (
              <div key={f.label}>
                <p className="text-[10px] tracking-widest uppercase text-muted font-body">{f.label}</p>
                <p className="text-sm text-ink font-body">{f.value}</p>
              </div>
            ) : null)}
          </div>
        </div>
      ) : (
        <SessionNoteForm
          sessionId={sessionId}  
          trainerId={trainer!.id}
          sessionDate={session.date_time}
        />
      )}
    </div>
  );
}