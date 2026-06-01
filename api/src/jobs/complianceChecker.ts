import { supabase } from "../lib/supabase";
import * as emailService from "../services/emailService";

export async function runComplianceCheck() {
  console.log("Running compliance check...");

  const now     = new Date();
  const in30    = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in7     = new Date(now.getTime() + 7  * 24 * 60 * 60 * 1000);

  // Get docs expiring in 30 days, 7 days, or already expired
  const { data: docs } = await supabase
    .from("trainer_docs")
    .select(`
      id, doc_type, expiry_date,
      trainers (id, full_name, email, status)
    `)
    .lte("expiry_date", in30.toISOString())
    .eq("approval_status", "valid");

  if (!docs) return;

  for (const doc of docs) {
    const trainer = doc.trainers as any;
    if (!trainer?.email) continue;

    const expiry           = new Date(doc.expiry_date);
    const daysUntilExpiry  = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const expiryDateStr    = expiry.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    // Check compliance table to avoid repeat emails
    const { data: complianceRecord } = await supabase
      .from("compliance")
      .select("notified_30d, notified_7d, notified_expired")
      .eq("user_id", trainer.id)
      .eq("item_type", doc.doc_type)
      .single();

    if (daysUntilExpiry <= 0 && !complianceRecord?.notified_expired) {
      await emailService.sendTrainerDocumentExpiring(
        trainer.email, trainer.full_name, doc.doc_type, expiryDateStr, 0
      );

      // Flag trainer as restricted
      await supabase
        .from("trainers")
        .update({ compliance_flag: true })
        .eq("id", trainer.id);

      await supabase
        .from("compliance")
        .upsert({
          user_id:          trainer.id,
          user_type:        "trainer",
          item_type:        doc.doc_type,
          expiry_date:      doc.expiry_date,
          status:           "expired",
          notified_expired: true,
          last_checked:     now.toISOString(),
        }, { onConflict: "user_id,item_type" });

    } else if (daysUntilExpiry <= 7 && daysUntilExpiry > 0 && !complianceRecord?.notified_7d) {
      await emailService.sendTrainerDocumentExpiring(
        trainer.email, trainer.full_name, doc.doc_type, expiryDateStr, daysUntilExpiry
      );

      await supabase
        .from("compliance")
        .upsert({
          user_id:      trainer.id,
          user_type:    "trainer",
          item_type:    doc.doc_type,
          expiry_date:  doc.expiry_date,
          status:       "expiring_soon",
          notified_7d:  true,
          last_checked: now.toISOString(),
        }, { onConflict: "user_id,item_type" });

    } else if (daysUntilExpiry <= 30 && daysUntilExpiry > 7 && !complianceRecord?.notified_30d) {
      await emailService.sendTrainerDocumentExpiring(
        trainer.email, trainer.full_name, doc.doc_type, expiryDateStr, daysUntilExpiry
      );

      await supabase
        .from("compliance")
        .upsert({
          user_id:      trainer.id,
          user_type:    "trainer",
          item_type:    doc.doc_type,
          expiry_date:  doc.expiry_date,
          status:       "expiring_soon",
          notified_30d: true,
          last_checked: now.toISOString(),
        }, { onConflict: "user_id,item_type" });
    }
  }

  console.log(`Compliance check complete. Checked ${docs.length} documents.`);
}