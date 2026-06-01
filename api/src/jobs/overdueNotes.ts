import { supabase } from "../lib/supabase";
import * as emailService from "../services/emailService";

export async function checkOverdueNotes() {
  console.log("Checking overdue session notes...");

  const now        = new Date();
  const cutoff12hr = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const cutoff24hr = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Sessions completed 12–24 hours ago with no notes
  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      id, date_time,
      clients (full_name),
      trainers (full_name, email)
    `)
    .eq("booking_status", "completed")
    .eq("notes_submitted", false)
    .lte("date_time", cutoff12hr.toISOString())
    .gte("date_time", cutoff24hr.toISOString());

  if (!sessions) return;

  for (const session of sessions) {
    const trainer = session.trainers as any;
    const client  = session.clients as any;

    if (!trainer?.email) continue;

    const sessionDate = new Date(session.date_time).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });

    await emailService.sendTrainerSessionNoteOverdue(
      trainer.email,
      trainer.full_name,
      client.full_name,
      sessionDate
    );

    // Mark notes as late in DB
    await supabase
      .from("sessions")
      .update({ updated_at: now.toISOString() })
      .eq("id", session.id);
  }

  console.log(`Sent overdue note alerts for ${sessions.length} session(s).`);
}