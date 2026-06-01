import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import net from "net"; // Added for port testing

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
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
    : "*",
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

// Temporary email test route — remove after testing
app.get("/testing-email", async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { sendEmail, FROM } = await import("./lib/email");
    
    console.log("📧 Testing email configuration...");
    console.log("   FROM:", FROM);
    console.log("   TO:", process.env.ADMIN_EMAIL);
    console.log("   Has API Key:", !!process.env.RESEND_API_KEY);
    
    const result = await sendEmail(
      process.env.ADMIN_EMAIL ?? "test@test.com",
      "FORMED Email Test",
      `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .success { color: #10b981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FORMED Platform</h1>
          </div>
          <div class="content">
            <h2 class="success">✅ Email Configuration Test</h2>
            <p>Your Resend integration is working correctly!</p>
            <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>From Address:</strong> ${process.env.EMAIL_FROM || 'onboarding@resend.dev'}</p>
          </div>
          <div class="footer">
            <p>This is an automated test from the FORMED API</p>
          </div>
        </div>
      </body>
      </html>
      `
    );
    
    const duration = Date.now() - startTime;
    
    res.json({ 
      success: result,
      method: "Resend API (HTTP)",
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL,
      configuration: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasFromAddress: !!process.env.EMAIL_FROM,
        hasFromName: !!process.env.EMAIL_FROM_NAME,
        nodeEnv: process.env.NODE_ENV,
      },
      performance: {
        duration_ms: duration,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error("Test endpoint error:", err);
    
    res.status(500).json({ 
      success: false,
      error: err.message,
      method: "Resend API (HTTP)",
      configuration: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasFromAddress: !!process.env.EMAIL_FROM,
        nodeEnv: process.env.NODE_ENV,
      },
      performance: {
        duration_ms: duration,
        timestamp: new Date().toISOString()
      },
      troubleshooting: [
        "Check that RESEND_API_KEY is set in Railway environment variables",
        "Verify EMAIL_FROM is set to 'onboarding@resend.dev' or a verified domain",
        "Ensure you have email credits available in Resend dashboard",
        "Check Railway logs for detailed error messages"
      ]
    });
  }
});



// Helper function to provide recommendations based on port test results
function getRecommendation(portResults: Record<string, any>, currentConfig: any): string {
  // Check which ports are open
  const openPorts = Object.entries(portResults)
    .filter(([_, result]: [string, any]) => result.status === "open")
    .map(([port]) => parseInt(port));
  
  if (openPorts.length === 0) {
    return "❌ No SMTP ports are accessible from Railway. Railway is likely blocking outbound SMTP. Consider using a dedicated email service like Resend (HTTP API) or SendGrid instead of direct SMTP.";
  }
  
  if (openPorts.includes(465)) {
    return "✅ Port 465 is open. Update your config: SMTP_PORT=465, SMTP_SECURE=true. This is the most reliable port for Gmail on Railway.";
  }
  
  if (openPorts.includes(587)) {
    return "✅ Port 587 is open. Keep SMTP_PORT=587, SMTP_SECURE=false. Make sure you've added 'family: 4' to your nodemailer config to force IPv4.";
  }
  
  if (openPorts.includes(2525)) {
    return "✅ Port 2525 is open (alternative SMTP). Try changing SMTP_PORT=2525 with SMTP_SECURE=false.";
  }
  
  return `⚠️ Open ports: ${openPorts.join(', ')}. Try using one of these ports in your SMTP configuration.`;
}

// ⚠️ 404 handler MUST be LAST - catches any unmatched routes
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

app.listen(PORT, () => {
  console.log(`FORMED API running on http://localhost:${PORT}`);
  console.log(`📧 Test SMTP ports at: http://localhost:${PORT}/test-smtp-ports`);
});
