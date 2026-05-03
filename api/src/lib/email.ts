import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM = `${process.env.EMAIL_FROM_NAME ?? "FORMED"} <${process.env.EMAIL_FROM ?? "notifications@formed.fit"}>`;

// Main send function using Resend API
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  console.log(`\n📧 SENDING EMAIL via Resend:`);
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   From: ${FROM}`);
  
  if (!process.env.RESEND_API_KEY) {
    console.error(`❌ RESEND_API_KEY is not set in environment variables`);
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error(`❌ Resend API error:`, error);
      return false;
    }

    console.log(`✅ Email sent successfully via Resend`);
    console.log(`   Message ID: ${data?.id}`);
    console.log(`   View in Resend: https://resend.com/emails/${data?.id}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to send email:`, error.message);
    return false;
  }
}