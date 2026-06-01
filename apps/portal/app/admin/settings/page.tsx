import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const planOptions = [
    { key: "1x_week",  label: "1x / week",  sessions: 4  },
    { key: "2x_week",  label: "2x / week",  sessions: 8  },
    { key: "3x_week",  label: "3x / week",  sessions: 12 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <SectionHeader title="System Settings" subtitle="Platform configuration" />

      <Card>
        <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">
          Membership Plans
        </p>
        <div className="space-y-0 border-t border-stone">
          {planOptions.map(p => (
            <div key={p.key} className="grid grid-cols-3 gap-4 py-3.5 border-b border-stone last:border-0">
              <p className="text-sm font-body text-ink">{p.label}</p>
              <p className="text-sm font-body text-muted">{p.sessions} sessions/month</p>
              <p className="text-xs text-muted font-body">Configure in Stripe</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">
          Cancellation Policy
        </p>
        <div className="space-y-0 border-t border-stone">
          {[
            { label: "Notice required",    value: "24 hours" },
            { label: "Late cancel penalty", value: "Session non-refundable" },
            { label: "No-show policy",      value: "Full charge applied" },
            { label: "Trainer cancellation", value: "Client fully refunded" },
          ].map(f => (
            <div key={f.label} className="grid grid-cols-2 gap-4 py-3.5 border-b border-stone last:border-0">
              <p className="text-xs text-muted font-body">{f.label}</p>
              <p className="text-xs text-ink font-body">{f.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">
          Integrations
        </p>
        {[
          { label: "Stripe",     status: "Connected",     note: "Payments active" },
          { label: "Supabase",   status: "Connected",     note: "Database + auth" },
          { label: "SendGrid",   status: "Configure",     note: "Add API key in env" },
        ].map(i => (
          <div key={i.label} className="grid grid-cols-3 gap-4 py-3.5 border-b border-stone last:border-0">
            <p className="text-sm font-body text-ink">{i.label}</p>
            <span className={`text-[10px] tracking-widests uppercase font-body self-center ${
              i.status === "Connected" ? "text-green-600" : "text-yellow-600"
            }`}>
              {i.status}
            </span>
            <p className="text-xs text-muted font-body">{i.note}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}