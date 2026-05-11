import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";  // ← Only import supabase
import * as emailService from "../services/emailService";

const router = Router();

// ── POST /api/applications/client ─────────────────────────────────────────
router.post("/client", async (req: Request, res: Response) => {
  const {
    full_name,
    email,
    phone,
    city,
    zip_code,
    location_type,
    goal,
    level,
    schedules,
    frequency,
    pricing_ok,
    other_info,
    source,
  } = req.body;

  // Basic validation
  if (!full_name || !email || !phone) {
    return res.status(400).json({
      error: "full_name, email, and phone are required",
    });
  }

  try {
    // 1. Check if user already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const alreadyExists = existingUsers?.users?.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase()
);

    if (alreadyExists) {
      return res.status(409).json({
        error: "An account with this email already exists. Please sign in to your portal.",
      });
    }

    // 2. Create Supabase Auth user with temporary password
    const tempPassword =
      Math.random().toString(36).slice(-12) +
      Math.random().toString(36).slice(-12).toUpperCase() +
      "!1";

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email:          email.toLowerCase(),
        password:       tempPassword,
        email_confirm:  true,
        user_metadata: {
          full_name,
          role: "client",
        },
      });

    if (authError) {
  console.error("=== AUTH ERROR START ===");
  console.error("Status:", authError.status);
  console.error("Code:", authError.code);
  console.error("Message:", authError.message);
  console.error("Full Error:", JSON.stringify(authError, null, 2));
  console.error("=== AUTH ERROR END ===");

  return res.status(400).json({
    error: authError.message,
    code: authError.code,
    full: authError
  });
}

    const userId = authData.user.id;

    // 3. Wait a moment for the trigger to fire
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 4. Update role in users table
    await supabase
      .from("users")
      .update({ role: "client", full_name, phone })
      .eq("id", userId);

    // 5. Create client record
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        user_id:   userId,
        full_name,
        email:     email.toLowerCase(),
        phone,
        city,
        zip_code,
        status:    "submitted",
        plan_type: frequency === "3x per week"
          ? "3x_week"
          : frequency === "2x per week"
          ? "2x_week"
          : "1x_week",
        source,
        onboarding_status: "incomplete",
        billing_status:    "awaiting_payment",
      })
      .select()
      .single();

    if (clientError) {
      console.error("Client record error:", clientError);
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({ error: clientError.message });
    }

    // 6. Create client onboarding checklist
    await supabase
      .from("client_onboarding")
      .insert({ client_id: client.id });

    // 7. Create intake form with application data
    await supabase.from("client_intake").insert({
      client_id:          client.id,
      primary_goals:      goal ? [goal] : [],
      training_history:   level ?? null,
      lifestyle_notes:    other_info ?? null,
      communication_preference: null,
    });

    // 8. Create in-portal notification for admin
    const { data: adminUser } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (adminUser) {
      await supabase.from("notifications").insert({
        user_id: adminUser.id,
        type:    "new_client_application",
        title:   `New client application: ${full_name}`,
        message: `${full_name} from ${city ?? "unknown"} applied for ${frequency ?? "unspecified"} membership.`,
        link:    `/admin/applications/clients/${client.id}`,
      });
    }

    // 9. Send emails
    await emailService.sendClientApplicationReceived(email.toLowerCase(), full_name);
    await emailService.sendAdminNewClientApplication(
      full_name,
      email.toLowerCase(),
      city ?? "",
      frequency ?? "not specified"
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully. We will be in touch within 24–48 hours.",
      client_id: client.id,
    });
  } catch (err: any) {
    console.error("Application error:", err);
    return res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
});

// ── POST /api/applications/trainer ────────────────────────────────────────
router.post("/trainer", async (req: Request, res: Response) => {
  const {
    full_name,
    email,
    phone,
    city,
    zip_code,
    certifications,
    experience_years,
    specialties,
    coaching_style,
    preferred_client_types,
    travel_radius,
    short_bio,
    why_join,
    training_philosophy,
    beginner_approach,
    plateau_approach,
    follows_standards,
  } = req.body;

  if (!full_name || !email || !phone) {
    return res.status(400).json({
      error: "full_name, email, and phone are required",
    });
  }

  try {
    // 1. Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    // ✅ Correct type (allows undefined)
const alreadyExists = existingUsers?.users?.find(
  (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
);

    if (alreadyExists) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    // 2. Create Auth user
    const tempPassword =
      Math.random().toString(36).slice(-12) +
      Math.random().toString(36).slice(-12).toUpperCase() +
      "!1";

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email:         email.toLowerCase(),
        password:      tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name,
          role: "trainer",
        },
      });

    if (authError) {
  console.error("=== AUTH ERROR START ===");
  console.error("Status:", authError.status);
  console.error("Code:", authError.code);
  console.error("Message:", authError.message);
  console.error("Full Error:", JSON.stringify(authError, null, 2));
  console.error("=== AUTH ERROR END ===");

  return res.status(400).json({
    error: authError.message,
    code: authError.code,
    full: authError
  });
}

    const userId = authData.user.id;

    await new Promise((resolve) => setTimeout(resolve, 500));

   // 3. Upsert users table — handles case where trigger hasn't fired yet
await supabase
  .from("users")
  .upsert(
    { id: userId, email: email.toLowerCase(), role: "trainer", full_name, phone },
    { onConflict: "id" }
  );

    // 4. Create trainer record
    const { data: trainer, error: trainerError } = await supabase
      .from("trainers")
      .insert({
        user_id:              userId,
        full_name,
        email:                email.toLowerCase(),
        phone,
        city,
        zip_code,
        status:               "submitted",
        certifications:       Array.isArray(certifications) ? certifications : certifications ? [certifications] : [],
        experience_years:     experience_years ? parseInt(experience_years) : null,
        specialties:          Array.isArray(specialties) ? specialties : specialties ? [specialties] : [],
        coaching_style:       coaching_style ?? null,
        preferred_client_types: Array.isArray(preferred_client_types) ? preferred_client_types : [],
        short_bio:            short_bio ?? null,
        max_active_clients:   10,
        current_client_count: 0,
        documents_status:     "incomplete",
        onboarding_status:    "incomplete",
        profile_status:       "incomplete",
      })
      .select()
      .single();

    if (trainerError) {
      console.error("Trainer record error:", trainerError);
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({ error: trainerError.message });
    }

    // 5. Notify admin in portal
    const { data: adminUser } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (adminUser) {
      await supabase.from("notifications").insert({
        user_id: adminUser.id,
        type:    "new_trainer_application",
        title:   `New trainer application: ${full_name}`,
        message: `${full_name} from ${city ?? "unknown"} applied to join as a trainer.`,
        link:    `/admin/applications/trainers/${trainer.id}`,
      });
    }

    // 6. Send emails
    await emailService.sendTrainerApplicationReceived(email.toLowerCase(), full_name);
    await emailService.sendAdminNewTrainerApplication(full_name, email.toLowerCase(), city ?? "");

    return res.status(201).json({
      success: true,
      message: "Application submitted. We review all applications personally and will be in touch within 48 hours.",
      trainer_id: trainer.id,
    });
  } catch (err: any) {
    console.error("Trainer application error:", err);
    return res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
});

// ── POST /api/applications/set-password ───────────────────────────────────
router.post("/set-password", async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "token and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters",
    });
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(token);

  if (error) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    data.user.id,
    { password }
  );

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  return res.json({ success: true, message: "Password set successfully" });
});

export default router;