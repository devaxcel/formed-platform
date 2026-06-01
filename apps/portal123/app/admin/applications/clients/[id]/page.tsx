import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import ClientStatusActions from "@/components/admin/ClientStatusActions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ClientApplicationDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>  // ✅ Fix: Make it a Promise
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // ✅ Fix: Await params to get the id
  const { id: clientId } = await params;

  const { data: client } = await supabase
    .from("clients")
    .select(`*, client_intake(*), client_onboarding(*)`)
    .eq("id", clientId)  // ✅ Use clientId instead of params.id
    .single();

  if (!client) redirect("/admin/applications/clients");

  const intake    = client.client_intake;
  const onboarding = client.client_onboarding;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/admin/applications/clients"
        className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body transition-colors">
        <ArrowLeft size={12} /> Back
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-light text-ink mb-1">{client.full_name}</h1>
          <p className="text-muted text-sm font-body">Applied {formatDate(client.created_at)}</p>
        </div>
        <Badge status={client.status} />
      </div>

      {/* Action buttons */}
      <ClientStatusActions clientId={client.id} currentStatus={client.status} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Personal Info</p>
          {[
            { label: "Email",       value: client.email },
            { label: "Phone",       value: client.phone },
            { label: "City",        value: client.city },
            { label: "ZIP",         value: client.zip_code },
            { label: "Plan",        value: client.plan_type?.replace("_", " ") },
            { label: "Monthly Rate", value: client.monthly_rate ? `$${client.monthly_rate}` : null },
            { label: "Source",      value: client.source },
          ].map(f => f.value ? (
            <div key={f.label} className="grid grid-cols-2 gap-3 py-2.5 border-b border-stone last:border-0">
              <p className="text-xs text-muted font-body">{f.label}</p>
              <p className="text-xs text-ink font-body capitalize">{f.value}</p>
            </div>
          ) : null)}
        </Card>

        {/* Onboarding status */}
        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Onboarding Checklist</p>
          {onboarding ? [
            { label: "Membership Agreement", done: onboarding.membership_agreement_signed },
            { label: "Liability Waiver",     done: onboarding.liability_waiver_signed },
            { label: "Auto-bill Auth",       done: onboarding.auto_bill_authorized },
            { label: "Health Intake",        done: onboarding.health_intake_completed },
            { label: "Payment Method",       done: onboarding.payment_method_on_file },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-stone last:border-0">
              <p className="text-xs font-body text-ink">{item.label}</p>
              <span className={`text-[10px] tracking-widest uppercase font-body px-2 py-0.5 ${
                item.done ? "bg-green-100 text-green-700" : "bg-stone text-muted"
              }`}>
                {item.done ? "Complete" : "Pending"}
              </span>
            </div>
          )) : (
            <p className="text-muted text-xs font-body">Onboarding not started.</p>
          )}
        </Card>
      </div>

      {/* Health intake */}
      {intake && (
        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Health & Intake</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "Primary Goals",       value: intake.primary_goals?.join(", ") },
              { label: "Training History",    value: intake.training_history },
              { label: "Injuries",            value: intake.injuries },
              { label: "Doctor Restrictions", value: intake.doctor_restrictions },
              { label: "Coaching Intensity",  value: intake.coaching_intensity },
              { label: "Communication Pref.", value: intake.communication_preference },
              { label: "Lifestyle Notes",     value: intake.lifestyle_notes },
            ].map(f => f.value ? (
              <div key={f.label}>
                <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-1">{f.label}</p>
                <p className="text-sm text-ink font-body leading-relaxed">{f.value}</p>
              </div>
            ) : null)}
          </div>
        </Card>
      )}
    </div>
  );
}