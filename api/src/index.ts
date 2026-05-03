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

// Temporary SMTP test route — remove after testing
app.get("/testing-email", async (req, res) => {
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

// NEW: Test which SMTP ports are accessible from Railway
app.get("/test-smtp-ports", async (req, res) => {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const ports = [25, 465, 587, 2525, 1025];
  const results: Record<string, any> = {};
  
  console.log(`🔍 Testing SMTP ports for host: ${smtpHost}`);
  
  for (const port of ports) {
    results[port] = await new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 8000; // 8 second timeout
      
      socket.setTimeout(timeout);
      
      const startTime = Date.now();
      
      socket.connect(port, smtpHost, () => {
        const duration = Date.now() - startTime;
        resolve({ 
          status: "open", 
          latency: `${duration}ms`,
          message: `Successfully connected to ${smtpHost}:${port}`
        });
        socket.destroy();
      });
      
      socket.on('error', (err: any) => {
        resolve({ 
          status: "blocked", 
          error: err.code || err.message,
          message: `Cannot connect to ${smtpHost}:${port} - ${err.code || err.message}`
        });
        socket.destroy();
      });
      
      socket.on('timeout', () => {
        resolve({ 
          status: "timeout", 
          error: "Connection timeout",
          message: `Connection to ${smtpHost}:${port} timed out after ${timeout}ms`
        });
        socket.destroy();
      });
    });
  }
  
  // Also test with current SMTP settings if they exist
  const currentConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    hasPassword: !!process.env.SMTP_PASS,
  };
  
  res.json({
    timestamp: new Date().toISOString(),
    smtpHost: smtpHost,
    environment: process.env.NODE_ENV || "development",
    portTestResults: results,
    currentSmtpConfig: currentConfig,
    recommendation: getRecommendation(results, currentConfig)
  });
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