import { sendEmail, FROM } from "../lib/email";
import * as T from "../lib/emailTemplates";
import { supabase } from "../lib/supabase";
const PORTAL_URL = process.env.PORTAL_URL ?? "http://localhost:3001";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@formed.fit";

// ─── Helper ───────────────────────────────────────────────────────────────────
async function send(to: string, subject: string, html: string) {
  return await sendEmail(to, subject, html);
}

// ─── CLIENT emails ────────────────────────────────────────────────────────────

export async function sendClientApplicationReceived(
  to: string,
  name: string
) {
  await send(to, "Application received — FORMED", T.clientApplicationReceived(name));
}

// In api/src/services/emailService.ts
export async function sendClientApproved(
  to: string,
  name: string,
  userId: string
) {
  console.log("\n========== SEND CLIENT APPROVED ==========");
  console.log("1. Function called with:", { to, name, userId });
  console.log("2. Checking if userId exists:", userId ? "YES" : "NO");
  
  if (!userId) {
    console.error("3. ❌ ERROR: userId is missing! Cannot generate magic link.");
    return;
  }
  
  console.log("4. Generating password reset link from Supabase...");
  
  // Generate a password reset link
  const { data, error } = await supabase.auth.admin.generateLink({
    type:  "recovery",
    email: to,
    options: {
      redirectTo: `${PORTAL_URL}/auth/set-password`,
    },
  });

  if (error) {
    console.error("5. ❌ Failed to generate password reset link:", error);
    console.error("6. Error details:", error.message);
    console.log("7. Falling back to generic link email...");
    await send(
      to,
      "Welcome to FORMED — Complete your setup",
      T.clientApproved(name, PORTAL_URL)
    );
    return;
  }

  console.log("8. ✅ Password reset link generated successfully");
  console.log("9. Magic link:", data.properties.action_link);
  console.log("10. Sending email with magic link...");
  
  await send(
    to,
    "Welcome to FORMED — Complete Your Trainer Onboarding",
    T.clientApprovedWithLink(name, data.properties.action_link, PORTAL_URL)
  );
  
  console.log("11. ✅ Email sent successfully!");
}


export async function sendClientWaitlisted(to: string, name: string,  userId: string) {
  await send(to, "You're on the FORMED waitlist", T.clientWaitlisted(name));
}

export async function sendClientRejected(to: string, name: string, userId: string ) {
  await send(to, "Update on your FORMED application", T.clientRejected(name));
}

export async function sendClientPaymentConfirmed(
  to: string,
  name: string,
  amount: number,
  sessionDate: string
) {
  await send(
    to,
    `Payment confirmed — $${amount.toFixed(2)}`,
    T.clientPaymentConfirmed(name, amount, sessionDate, PORTAL_URL)
  );
}

export async function sendClientPaymentFailed(to: string, name: string) {
  await send(to, "Action required: Payment failed", T.clientPaymentFailed(name, PORTAL_URL));
}

export async function sendClientOnboardingReminder(
  to: string,
  name: string,
  stepsRemaining: number
) {
  await send(
    to,
    "Complete your FORMED setup",
    T.clientOnboardingReminder(name, PORTAL_URL, stepsRemaining)
  );
}

export async function sendClientTrainerMatched(
  to: string,
  clientName: string,
  trainerName: string,
  trainerBio: string,
  trainerSpecialties: string[]
) {
  await send(
    to,
    `Meet your trainer — ${trainerName}`,
    T.clientTrainerMatched(clientName, trainerName, trainerBio, trainerSpecialties, PORTAL_URL)
  );
}

export async function sendClientSessionReminder(
  to: string,
  name: string,
  trainerName: string,
  sessionDate: string,
  sessionTime: string,
  location: string
) {
  await send(
    to,
    `Reminder: Session tomorrow at ${sessionTime}`,
    T.clientSessionReminder(name, trainerName, sessionDate, sessionTime, location, PORTAL_URL)
  );
}

export async function sendClientSessionCancelled(
  to: string,
  name: string,
  sessionDate: string,
  cancelledBy: string
) {
  await send(
    to,
    "Session cancelled",
    T.clientSessionCancelled(name, sessionDate, cancelledBy, PORTAL_URL)
  );
}

export async function sendClientMembershipPaused(to: string, name: string) {
  await send(to, "Your membership has been paused", T.clientMembershipPauseConfirmed(name, PORTAL_URL));
}

export async function sendClientProgressReviewReady(to: string, name: string) {
  await send(to, "Your monthly progress review is ready", T.clientProgressReviewReady(name, PORTAL_URL));
}

// ─── TRAINER emails ───────────────────────────────────────────────────────────

export async function sendTrainerApplicationReceived(to: string, name: string) {
  await send(to, "Trainer application received — FORMED", T.trainerApplicationReceived(name));
}

export async function sendTrainerApproved(
  to: string,
  name: string
) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: to,
    options: {
      redirectTo: `${PORTAL_URL}/auth/set-password`,
    },
  });

  if (error) {
    console.error("Failed to generate magic link for trainer:", error);
    // Fallback — send without link, trainer can use forgot password
    await send(
      to,
      "Welcome to FORMED — Complete Your Trainer Onboarding",
      T.trainerApproved(name, PORTAL_URL, to, "")
    );
    return;
  }

  await send(
    to,
    "Welcome to FORMED — Complete Your Trainer Onboarding",
    T.trainerApprovedWithLink(name, data.properties.action_link, PORTAL_URL)
  );
}

export async function sendTrainerRejected(to: string, name: string) {
  await send(to, "Update on your FORMED trainer application", T.trainerRejected(name));
}

export async function sendTrainerClientAssigned(
  to: string,
  trainerName: string,
  clientFirstName: string,
  clientCity: string,
  clientGoals: string[],
  startDate: string
) {
  await send(
    to,
    `New client assigned: ${clientFirstName}`,
    T.trainerClientAssigned(trainerName, clientFirstName, clientCity, clientGoals, startDate, PORTAL_URL)
  );
}

export async function sendTrainerSessionNoteOverdue(
  to: string,
  trainerName: string,
  clientName: string,
  sessionDate: string
) {
  await send(
    to,
    `Action required: Session notes overdue — ${clientName}`,
    T.trainerSessionNoteOverdue(trainerName, clientName, sessionDate, PORTAL_URL)
  );
}

export async function sendTrainerDocumentExpiring(
  to: string,
  trainerName: string,
  docType: string,
  expiryDate: string,
  daysUntilExpiry: number
) {
  const subject =
    daysUntilExpiry === 0
      ? `Expired: ${docType.replace(/_/g, " ")} — action required`
      : `Expiring in ${daysUntilExpiry} days: ${docType.replace(/_/g, " ")}`;

  await send(
    to,
    subject,
    T.trainerDocumentExpiring(trainerName, docType, expiryDate, daysUntilExpiry, PORTAL_URL)
  );
}

export async function sendTrainerPayoutApproved(
  to: string,
  trainerName: string,
  amount: number,
  sessionCount: number
) {
  await send(
    to,
    `Payout approved — $${amount.toFixed(2)}`,
    T.trainerPayoutApproved(trainerName, amount, sessionCount, PORTAL_URL)
  );
}

export async function sendTrainerPayoutRejected(
  to: string,
  trainerName: string,
  amount: number,
  reason: string
) {
  await send(
    to,
    "Payout request not approved",
    T.trainerPayoutRejected(trainerName, amount, reason, PORTAL_URL)
  );
}

// ─── ADMIN / INTERNAL ─────────────────────────────────────────────────────────

export async function sendAdminNewClientApplication(
  clientName: string,
  clientEmail: string,
  clientCity: string,
  plan: string
) {
  await send(
    ADMIN_EMAIL,
    `New client application: ${clientName}`,
    T.adminNewClientApplication(clientName, clientEmail, clientCity, plan, PORTAL_URL)
  );
}

export async function sendAdminNewTrainerApplication(
  trainerName: string,
  trainerEmail: string,
  trainerCity: string
) {
  await send(
    ADMIN_EMAIL,
    `New trainer application: ${trainerName}`,
    T.adminNewTrainerApplication(trainerName, trainerEmail, trainerCity, PORTAL_URL)
  );
}
