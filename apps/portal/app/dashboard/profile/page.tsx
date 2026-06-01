import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients")
    .select(`
      *,
      trainers:assigned_trainer_id(id, full_name),
      client_intake(*)
    `)
    .eq("user_id", user.id)
    .single();

  const intake = client?.client_intake;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">

      {/* Profile hero */}
      <div className="bg-ink p-8 flex items-start gap-6">
        {/* Avatar */}
        <div className="w-16 h-16 bg-warm/20 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-2xl font-light text-cream">
            {client?.full_name?.[0] ?? "?"}
          </span>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-light text-cream mb-1">
            {client?.full_name}
          </h1>
          <p className="text-cream/50 text-sm font-body">
            Member since {client?.created_at ? formatDate(client.created_at) : "—"}
          </p>
          {client?.trainers && (
            <p className="text-warm/70 text-sm font-body mt-1">
              Training with {client.trainers.full_name}
            </p>
          )}
        </div>
      </div>

      {/* Goals — prominent */}
      {intake?.primary_goals?.length > 0 && (
        <Card>
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] tracking-widests uppercase text-muted font-body">
              Your Goals
            </p>
            <p className="text-[10px] text-muted font-body italic">
              This helps your trainer personalise your programme
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {intake.primary_goals.map((g: string) => (
              <span key={g} className="bg-ink text-cream text-xs font-body px-3 py-1.5">
                {g}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Coaching profile */}
      {intake && (
        <Card>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-5 font-body">
            Coaching Profile
          </p>
          <p className="text-[10px] text-muted font-body italic mb-4">
            This information helps your trainer deliver the best experience for you
          </p>
          <div className="space-y-0 border-t border-stone">
            {[
              { label: "Training History",   value: intake.training_history },
              { label: "Injuries / Limitations", value: intake.injuries ?? "None reported" },
              { label: "Coaching Intensity", value: intake.coaching_intensity },
              { label: "Communication Pref.", value: intake.communication_preference },
              { label: "Lifestyle Notes",    value: intake.lifestyle_notes },
            ].map(f => f.value ? (
              <div key={f.label} className="grid grid-cols-2 gap-4 py-3.5 border-b border-stone">
                <p className="text-xs text-muted font-body">{f.label}</p>
                <p className="text-sm text-ink font-body leading-relaxed">{f.value}</p>
              </div>
            ) : null)}
          </div>
        </Card>
      )}

      {/* Personal details */}
      <Card>
        <p className="text-[10px] tracking-widests uppercase text-muted mb-5 font-body">
          Personal Information
        </p>
        <div className="space-y-0 border-t border-stone">
          {[
            { label: "Full Name",    value: client?.full_name },
            { label: "Email",        value: user.email },
            { label: "Phone",        value: client?.phone },
            { label: "City",         value: client?.city },
            { label: "Membership",   value: client?.plan_type?.replace("_", " ") },
          ].map(f => f.value ? (
            <div key={f.label} className="grid grid-cols-2 gap-4 py-3.5 border-b border-stone last:border-0">
              <p className="text-xs text-muted font-body">{f.label}</p>
              <p className="text-sm text-ink font-body capitalize">{f.value}</p>
            </div>
          ) : null)}
        </div>
        <p className="text-xs text-muted font-body mt-4">
          To update your information, contact your trainer or submit a{" "}
          <a href="/dashboard/support" className="text-ink underline underline-offset-2">support request</a>.
        </p>
      </Card>

    </div>
  );
}