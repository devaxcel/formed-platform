// ─── Base wrapper ────────────────────────────────────────────────────────────
function base(content: string, preheader = ""): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FORMED</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #F5F2EC; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0C0C0B; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border: 1px solid #E8E4DC; padding: 40px; }
    .logo { font-size: 22px; font-weight: 300; letter-spacing: 6px; color: #0C0C0B; margin-bottom: 32px; display: block; }
    .divider { height: 1px; background: #E8E4DC; margin: 28px 0; }
    .label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #8C8880; margin-bottom: 6px; }
    .value { font-size: 14px; color: #0C0C0B; margin-bottom: 16px; }
    .btn { display: inline-block; background: #0C0C0B; color: #F5F2EC; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; padding: 14px 32px; text-decoration: none; margin-top: 24px; }
    .footer { margin-top: 24px; font-size: 11px; color: #8C8880; line-height: 1.6; text-align: center; }
    .highlight { background: #F5F2EC; border-left: 3px solid #0C0C0B; padding: 16px 20px; margin: 20px 0; }
    h1 { font-size: 28px; font-weight: 300; color: #0C0C0B; margin-bottom: 12px; line-height: 1.2; }
    p { font-size: 14px; color: #5F5E5A; line-height: 1.7; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E8E4DC; }
    .row:last-child { border-bottom: none; }
    .row-label { font-size: 12px; color: #8C8880; }
    .row-value { font-size: 12px; color: #0C0C0B; font-weight: 500; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
  <div class="wrap">
    <div class="card">
      <span class="logo">FORMED</span>
      ${content}
    </div>
    <div class="footer">
      <p>FORMED · Private Personal Training · Tampa Bay</p>
      <p style="margin-top:6px;">© ${new Date().getFullYear()} FORMED. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─── CLIENT EMAILS ────────────────────────────────────────────────────────────

export function clientApplicationReceived(name: string): string {
  return base(`
    <h1>Application received.</h1>
    <p>Hi ${name},</p>
    <p>Thank you for applying to FORMED. We review every application personally and will follow up within <strong>24–48 hours</strong>.</p>
    <div class="highlight">
      <p style="margin:0;color:#0C0C0B;">We'll confirm trainer availability, your location, and membership fit before getting back to you.</p>
    </div>
    <p>In the meantime, if you have any questions reach us at <a href="mailto:hello@formed.fit" style="color:#0C0C0B;">hello@formed.fit</a></p>
  `, "We received your application — we'll be in touch within 24–48 hours.");
}

export function clientApproved(name: string, portalUrl: string): string {
  return base(`
    <h1>Welcome to FORMED.</h1>
    <p>Hi ${name},</p>
    <p>Your application has been approved. Complete your membership setup to get matched with your trainer.</p>
    <div class="highlight">
      <p style="margin:0;color:#0C0C0B;">Next step: Complete your onboarding — it takes less than 5 minutes.</p>
    </div>
    <a href="${portalUrl}/dashboard/onboarding" class="btn">Complete Setup</a>
  `, "Your FORMED application has been approved.");
}

export function clientWaitlisted(name: string): string {
  return base(`
    <h1>You're on the waitlist.</h1>
    <p>Hi ${name},</p>
    <p>Thank you for your interest in FORMED. We currently don't have trainer availability in your area, but we've added you to our waitlist.</p>
    <p>We'll notify you as soon as a spot opens up — typically within 2–4 weeks.</p>
    <p>Questions? Contact us at <a href="mailto:hello@formed.fit" style="color:#0C0C0B;">hello@formed.fit</a></p>
  `, "You've been added to the FORMED waitlist.");
}

export function clientRejected(name: string): string {
  return base(`
    <h1>Thank you for applying.</h1>
    <p>Hi ${name},</p>
    <p>After reviewing your application, we're not able to offer membership at this time. This is typically due to trainer availability in your area or scheduling constraints.</p>
    <p>We encourage you to reapply in 60 days as availability changes frequently.</p>
    <p>Thank you for your interest in FORMED.</p>
  `, "Update on your FORMED application.");
}

export function clientPaymentConfirmed(
  name: string,
  amount: number,
  membershipPlan: string,
  date: string,
): string {
  return base(`
    <h1>Payment Confirmed</h1>
    <p>Hi ${name},</p>
    <p>Your FORMED membership payment has been processed successfully.</p>
    <p><strong>Payment Summary:</strong></p>
    <ul>
      <li><strong>Membership:</strong> ${membershipPlan}</li>
      <li><strong>Amount:</strong> $${amount.toFixed(2)}</li>
      <li><strong>Date:</strong> ${date}</li>
    </ul>
    <p>Thank you for training with FORMED.</p>
    <p>— FORMED Billing</p>
  `, `Payment Confirmed`);
}

export function clientPaymentFailed(name: string, billingLink: string): string {
  return base(`
    <h1>Action Required: Payment Could Not Be Processed</h1>
    <p>Hi ${name},</p>
    <p>We were unable to process your recent FORMED membership payment.</p>
    <p>Please update your payment method to avoid interruptions to your membership and session scheduling.</p>
    <p>Update billing here:<br>
    <a href="${billingLink}" style="color:#0C0C0B;">${billingLink}</a></p>
    <p>If you need assistance, contact us at <a href="mailto:hello@formed.fit" style="color:#0C0C0B;">hello@formed.fit</a>.</p>
    <p>— FORMED Billing</p>
  `, "Action Required: Payment Could Not Be Processed");
}

export function clientOnboardingReminder(name: string, portalUrl: string, stepsRemaining: number): string {
  return base(`
    <h1>Complete your setup.</h1>
    <p>Hi ${name},</p>
    <p>You're almost ready to get matched with your trainer. You have <strong>${stepsRemaining} step${stepsRemaining > 1 ? "s" : ""} remaining</strong> to complete your onboarding.</p>
    <div class="highlight">
      <p style="margin:0;color:#0C0C0B;">Complete your onboarding to get matched and schedule your first session.</p>
    </div>
    <a href="${portalUrl}/dashboard/onboarding" class="btn">Continue Setup</a>
  `, `${stepsRemaining} step${stepsRemaining > 1 ? "s" : ""} left to complete your FORMED setup.`);
}

export function clientTrainerMatched(
  clientName: string,
  trainerName: string,
  trainerBio: string,
  trainerSpecialties: string[],
  portalUrl: string
): string {
  return base(`
    <h1>Meet your trainer.</h1>
    <p>Hi ${clientName},</p>
    <p>We've matched you with your personal trainer. We carefully selected them based on your goals, location, and schedule.</p>
    <div class="highlight">
      <p class="label">Your Trainer</p>
      <p style="font-size:18px;font-weight:300;color:#0C0C0B;margin-bottom:8px;">${trainerName}</p>
      <p style="font-size:13px;color:#5F5E5A;margin-bottom:8px;">${trainerBio}</p>
      <p style="font-size:11px;color:#8C8880;">${trainerSpecialties.join(" · ")}</p>
    </div>
    <a href="${portalUrl}/dashboard" class="btn">View My Dashboard</a>
    <p style="margin-top:16px;">Your trainer will reach out to confirm your first session shortly.</p>
  `, `You've been matched with ${trainerName}.`);
}

export function clientSessionReminder(
  name: string,
  trainerName: string,
  sessionTime: string,
): string {
  return base(`
    <h1>Reminder: Your FORMED Session Is Tomorrow</h1>
    <p>Hi ${name},</p>
    <p>This is a reminder that you have a FORMED session scheduled tomorrow.</p>
    <p><strong>Session Details:</strong></p>
    <ul>
      <li><strong>Trainer:</strong> ${trainerName}</li>
      <li><strong>Time:</strong> ${sessionTime}</li>
    </ul>
    <p>Stay consistent. We'll see you tomorrow.</p>
    <p>— FORMED</p>
  `, `Reminder: Your FORMED Session Is Tomorrow`);
}

export function clientSessionCancelled(
  name: string,
  sessionDate: string,
  cancelledBy: string,
  portalUrl: string
): string {
  return base(`
    <h1>Session cancelled.</h1>
    <p>Hi ${name},</p>
    <p>Your session on <strong>${sessionDate}</strong> has been cancelled ${cancelledBy === "trainer" ? "by your trainer" : ""}.</p>
    ${cancelledBy === "trainer" ? `
    <div class="highlight">
      <p style="margin:0;color:#0C0C0B;">Our operations team will be in touch to reschedule at a time that works for you. You will not be charged for this session.</p>
    </div>
    ` : ""}
    <a href="${portalUrl}/dashboard/sessions" class="btn">View Sessions</a>
  `, `Your session on ${sessionDate} has been cancelled.`);
}

export function clientMembershipPauseConfirmed(name: string, portalUrl: string): string {
  return base(`
    <h1>Membership paused.</h1>
    <p>Hi ${name},</p>
    <p>Your FORMED membership has been paused as requested. No further billing will occur while your membership is on hold.</p>
    <p>When you're ready to resume, contact us at <a href="mailto:hello@formed.fit" style="color:#0C0C0B;">hello@formed.fit</a> or visit your portal.</p>
    <a href="${portalUrl}/dashboard" class="btn">My Dashboard</a>
  `, "Your FORMED membership has been paused.");
}

export function clientProgressReviewReady(name: string, portalUrl: string): string {
  return base(`
    <h1>Time For Your Monthly Progress Check-In</h1>
    <p>Hi ${name},</p>
    <p>It's time for your monthly FORMED progress review.</p>
    <p>Please log into your portal to:</p>
    <ul>
      <li>Upload updated progress photos</li>
      <li>Update measurements</li>
      <li>Review your trainer feedback</li>
      <li>Track your results</li>
    </ul>
    <p>Consistency creates results.</p>
    <p>Access your portal here:<br>
    <a href="${portalUrl}" style="color:#0C0C0B;">${portalUrl}</a></p>
    <p>— FORMED</p>
  `, "Time For Your Monthly Progress Check-In");
}

// ─── TRAINER EMAILS ───────────────────────────────────────────────────────────

export function trainerApplicationReceived(name: string): string {
  return base(`
    <h1>We Received Your FORMED Trainer Application</h1>
    <p>Hi ${name},</p>
    <p>Thank you for applying to become a FORMED trainer.</p>
    <p>We're currently reviewing your application and experience. If selected, a member of our team will contact you regarding next steps and the interview process.</p>
    <p>At FORMED, we focus on delivering a premium client experience through professionalism, accountability, and personalized coaching.</p>
    <p>We appreciate your interest in joining the brand.</p>
    <p>— FORMED Recruiting<br>
    <a href="mailto:hello@formed.fit" style="color:#0C0C0B;">hello@formed.fit</a></p>
  `, "We received your FORMED trainer application.");
}

export function trainerApproved(name: string, portalUrl: string, email: string, temporaryPassword: string): string {
  return base(`
    <h1>Welcome to FORMED</h1>
    <p>Hi ${name},</p>
    <p>Congratulations — your FORMED trainer application has been approved.</p>
    <p>Your trainer portal is now ready.</p>
    <p>Access your trainer portal here:<br>
    <a href="${portalUrl}" style="color:#0C0C0B;">${portalUrl}</a></p>
    <p>Inside the portal, please complete:</p>
    <ul>
      <li>onboarding modules</li>
      <li>certification uploads</li>
      <li>availability settings</li>
      <li>service areas</li>
      <li>payout setup</li>
    </ul>
    <p>Your temporary login credentials:</p>
    <p>Email: ${email}<br>
    Temporary Password: ${temporaryPassword}</p>
    <p>We're excited to have you join FORMED.</p>
    <p>— Rodney Cilien<br>
    Founder, FORMED</p>
  `, "Welcome to FORMED");
}

export function trainerRejected(name: string): string {
  return base(`
    <h1>Thank you for applying.</h1>
    <p>Hi ${name},</p>
    <p>After reviewing your application, we're not able to move forward at this time. We receive a high volume of applications and our roster has limited capacity per city.</p>
    <p>We encourage you to reapply in 90 days. Keep building your portfolio and certifications.</p>
    <p>Thank you for your interest in FORMED.</p>
  `, "Update on your FORMED trainer application.");
}

export function trainerClientAssigned(
  trainerName: string,
  clientFirstName: string,
  clientCity: string,
  clientGoals: string[],
  startDate: string,
  portalUrl: string
): string {
  return base(`
    <h1>New client assigned.</h1>
    <p>Hi ${trainerName},</p>
    <p>You have been assigned a new client. Please review their profile and reach out to confirm the first session.</p>
    <div class="highlight">
      <div class="row"><span class="row-label">Client</span><span class="row-value">${clientFirstName}</span></div>
      <div class="row"><span class="row-label">Location</span><span class="row-value">${clientCity}</span></div>
      <div class="row"><span class="row-label">Goals</span><span class="row-value">${clientGoals.join(", ")}</span></div>
      <div class="row"><span class="row-label">Start Date</span><span class="row-value">${startDate}</span></div>
    </div>
    <a href="${portalUrl}/trainer/clients" class="btn">View Client</a>
  `, `New client assigned: ${clientFirstName} in ${clientCity}.`);
}

export function trainerSessionNoteOverdue(
  name: string,
  clientName: string,
  sessionDate: string,
  portalUrl: string
): string {
  return base(`
    <h1>Session notes overdue.</h1>
    <p>Hi ${name},</p>
    <p>Session notes for your session with <strong>${clientName}</strong> on ${sessionDate} have not been submitted.</p>
    <div class="highlight">
      <p style="margin:0;color:#0C0C0B;">Notes must be submitted within 12 hours of session completion. Please submit them now to avoid a compliance flag.</p>
    </div>
    <a href="${portalUrl}/trainer/notes" class="btn">Submit Notes</a>
  `, `Action required: Session notes for ${clientName} are overdue.`);
}

export function trainerDocumentExpiring(
  name: string,
  docType: string,
  expiryDate: string,
  daysUntilExpiry: number,
  portalUrl: string
): string {
  return base(`
    <h1>Document expiring ${daysUntilExpiry === 0 ? "today" : `in ${daysUntilExpiry} days`}.</h1>
    <p>Hi ${name},</p>
    <p>Your <strong>${docType.replace(/_/g, " ")}</strong> ${daysUntilExpiry === 0 ? "has expired" : `expires on ${expiryDate}`}. Please upload a renewed version to avoid being restricted from new client assignments.</p>
    <div class="highlight">
      <div class="row"><span class="row-label">Document</span><span class="row-value">${docType.replace(/_/g, " ")}</span></div>
      <div class="row"><span class="row-label">Expiry Date</span><span class="row-value">${expiryDate}</span></div>
      <div class="row"><span class="row-label">Status</span><span class="row-value">${daysUntilExpiry === 0 ? "Expired" : `${daysUntilExpiry} days remaining`}</span></div>
    </div>
    <a href="${portalUrl}/trainer/profile" class="btn">Upload Document</a>
  `, `${daysUntilExpiry === 0 ? "Expired" : `Expiring in ${daysUntilExpiry} days`}: ${docType.replace(/_/g, " ")}`);
}

export function trainerPayoutApproved(
  name: string,
  amount: number,
  sessionCount: number,
  portalUrl: string
): string {
  return base(`
    <h1>Payout approved.</h1>
    <p>Hi ${name},</p>
    <p>Your payout request has been approved and will be processed shortly.</p>
    <div class="highlight">
      <div class="row"><span class="row-label">Amount</span><span class="row-value">$${amount.toFixed(2)}</span></div>
      <div class="row"><span class="row-label">Sessions</span><span class="row-value">${sessionCount}</span></div>
      <div class="row"><span class="row-label">Status</span><span class="row-value">Approved — processing</span></div>
    </div>
    <a href="${portalUrl}/trainer/wallet" class="btn">View Wallet</a>
  `, `Payout of $${amount.toFixed(2)} approved.`);
}

export function trainerPayoutRejected(
  name: string,
  amount: number,
  reason: string,
  portalUrl: string
): string {
  return base(`
    <h1>Payout not approved.</h1>
    <p>Hi ${name},</p>
    <p>Your payout request of <strong>$${amount.toFixed(2)}</strong> could not be approved at this time.</p>
    <div class="highlight">
      <p class="label">Reason</p>
      <p style="margin:0;color:#0C0C0B;">${reason}</p>
    </div>
    <p>If you have questions, contact us at <a href="mailto:hello@formed.fit" style="color:#0C0C0B;">hello@formed.fit</a></p>
    <a href="${portalUrl}/trainer/wallet" class="btn">View Wallet</a>
  `, `Payout of $${amount.toFixed(2)} could not be approved.`);
}

// ─── ADMIN / INTERNAL EMAILS ─────────────────────────────────────────────────

export function adminNewClientApplication(
  clientName: string,
  clientEmail: string,
  clientCity: string,
  plan: string,
  adminPortalUrl: string
): string {
  return base(`
    <h1>New client application.</h1>
    <div class="highlight">
      <div class="row"><span class="row-label">Name</span><span class="row-value">${clientName}</span></div>
      <div class="row"><span class="row-label">Email</span><span class="row-value">${clientEmail}</span></div>
      <div class="row"><span class="row-label">City</span><span class="row-value">${clientCity}</span></div>
      <div class="row"><span class="row-label">Plan</span><span class="row-value">${plan}</span></div>
    </div>
    <a href="${adminPortalUrl}/admin/applications/clients" class="btn">Review Application</a>
  `, `New application from ${clientName} in ${clientCity}.`);
}
export function clientApprovedWithLink(
  name: string,
  passwordLink: string,
  portalUrl: string
): string {
  return base(`
    <h1>Welcome to FORMED.</h1>
    <p>Hi ${name},</p>
    <p>Your application has been approved. Set your password below to access your client portal and complete your membership setup.</p>
    <div class="highlight">
      <p style="margin:0;color:#0C0C0B;">Once you set your password, you'll be guided through a quick onboarding process before getting matched with your trainer.</p>
    </div>
    <a href="${passwordLink}" class="btn">Set Your Password</a>
    <p style="margin-top:16px;font-size:12px;color:#8C8880;">This link expires in 24 hours. If it expires, visit <a href="${portalUrl}/auth/forgot-password" style="color:#0C0C0B;">portal.formed.fit</a> to request a new one.</p>
  `, "Your FORMED application has been approved — set your password to get started.");
}

export function trainerApprovedWithLink(
  name: string,
  passwordLink: string,
  portalUrl: string
): string {
  return base(`
    <h1>Welcome to FORMED.</h1>
    <p>Hi ${name},</p>
    <p>Congratulations — your trainer application has been approved. Set your password to access the FORMED trainer portal and begin your onboarding.</p>
    <div class="highlight">
      <p style="margin:0;color:#0C0C0B;">After setting your password, complete the onboarding programme to become active and start receiving client assignments.</p>
    </div>
    <a href="${passwordLink}" class="btn">Set Your Password</a>
    <p style="margin-top:16px;font-size:12px;color:#8C8880;">This link expires in 24 hours. If it expires, visit <a href="${portalUrl}/auth/forgot-password" style="color:#0C0C0B;">portal.formed.fit</a> to request a new one.</p>
  `, "Your FORMED trainer application has been approved.");
}
export function adminNewTrainerApplication(
  trainerName: string,
  trainerEmail: string,
  trainerCity: string,
  adminPortalUrl: string
): string {
  return base(`
    <h1>New trainer application.</h1>
    <div class="highlight">
      <div class="row"><span class="row-label">Name</span><span class="row-value">${trainerName}</span></div>
      <div class="row"><span class="row-label">Email</span><span class="row-value">${trainerEmail}</span></div>
      <div class="row"><span class="row-label">City</span><span class="row-value">${trainerCity}</span></div>
    </div>
    <a href="${adminPortalUrl}/admin/applications/trainers" class="btn">Review Application</a>
  `, `New trainer application from ${trainerName} in ${trainerCity}.`);
}