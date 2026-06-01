import { supabase } from "../lib/supabase";
import * as emailService from "../services/emailService";

export async function sendSessionReminders() {
  console.log("Sending session reminders...");

  const now      = new Date();
  const in24hrs  = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25hrs  = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  // Find sessions in the next 24–25 hour window
  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      id, date_time, location_notes,
      clients (full_name, email),
      trainers (full_name)
    `)
    .gte("date_time", in24hrs.toISOString())
    .lte("date_time", in25hrs.toISOString())
    .in("booking_status", ["paid", "admin_confirmed"]);

  if (!sessions) return;

  for (const session of sessions) {
    const client  = session.clients as any;
    const trainer = session.trainers as any;

    if (!client?.email) continue;

    const dt          = new Date(session.date_time);
    const sessionDate = dt.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });
    const sessionTime = dt.toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });

    await emailService.sendClientSessionReminder(
      client.email,
      client.full_name,
      trainer.full_name,
      sessionDate,
      sessionTime,
      session.location_notes ?? "Your registered address"
    );
  }

  console.log(`Sent reminders for ${sessions.length} session(s).`);
}