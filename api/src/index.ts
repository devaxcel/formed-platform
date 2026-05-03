import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes        from "./routes/auth.routes";
import clientRoutes      from "./routes/clients.routes";
import trainerRoutes     from "./routes/trainers.routes";
import sessionRoutes     from "./routes/sessions.routes";
import matchingRoutes    from "./routes/matching.routes";
import paymentRoutes     from "./routes/payments.routes";
import ticketRoutes      from "./routes/tickets.routes";
import notificationRoutes from "./routes/notifications.routes"; 
import applicationRoutes from "./routes/applications.routes";
// Add cron job imports
import { runComplianceCheck } from "./jobs/complianceChecker";
import { sendSessionReminders } from "./jobs/sessionReminders";
import { checkOverdueNotes }   from "./jobs/overdueNotes";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin:      process.env.ALLOWED_ORIGINS?.split(",") || "*",
  credentials: true,
}));
app.use(morgan("dev"));

// ⚠️  Webhook MUST come before express.json()
// Stripe needs the raw body to verify the signature
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

// All other routes use JSON parsing
app.use(express.json());

// Routes
app.use("/api/auth",         authRoutes);
app.use("/api/clients",      clientRoutes);
app.use("/api/trainers",     trainerRoutes);
app.use("/api/sessions",     sessionRoutes);
app.use("/api/matching",     matchingRoutes);
app.use("/api/payments",     paymentRoutes);
app.use("/api/tickets",      ticketRoutes);
app.use("/api/notifications", notificationRoutes); 
app.use("/api/applications", applicationRoutes);
app.get("/health", (req, res) => {
  res.json({
    status:    "ok",
    service:   "FORMED API",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Cron-style jobs (run on interval in development) ──────────────────────
// In production replace these with actual cron (Railway cron, Vercel cron, or node-cron)

// Session reminders — check every hour
setInterval(async () => {
  await sendSessionReminders();
}, 60 * 60 * 1000);

// Overdue notes — check every 2 hours
setInterval(async () => {
  await checkOverdueNotes();
}, 2 * 60 * 60 * 1000);

// Compliance check — once per day
setInterval(async () => {
  await runComplianceCheck();
}, 24 * 60 * 60 * 1000);

// Run all once on startup in development so you can test immediately
if (process.env.NODE_ENV !== "production") {
  setTimeout(async () => {
    await sendSessionReminders();
    await checkOverdueNotes();
    await runComplianceCheck();
  }, 5000);
}
// Temporary SMTP test route — remove after testing
app.get("/test-email", async (req, res) => {
  try {
    const { sendEmail } = await import("./lib/email");
    const result = await sendEmail(
      process.env.ADMIN_EMAIL ?? "test@test.com",
      "FORMED SMTP Test",
      "<h1>SMTP is working</h1><p>If you see this, email is configured correctly.</p>"
    );
    res.json({ 
      success: result,
      smtpHost: process.env.SMTP_HOST,
      smtpUser: process.env.SMTP_USER,
      smtpPort: process.env.SMTP_PORT,
      from: process.env.EMAIL_FROM
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`FORMED API running on http://localhost:${PORT}`);
});