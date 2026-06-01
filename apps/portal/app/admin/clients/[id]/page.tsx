import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import ClientStatusActions from "@/components/admin/ClientStatusActions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

// Fix: Update params type to Promise and await it
export default async function AdminClientDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fix: Await the params to get the id
  const { id } = await params;

  const { data: client } = await supabase
    .from("clients")
    .select(`
      *,
      trainers:assigned_trainer_id(id, full_name),
      client_intake(*),
      sessions(id, date_time, booking_status, session_type),
      payments(id, amount, status, created_at),
      support_tickets(id, category, status, created_at)
    `)
    .eq("id", id)  // Fix: Use the id variable instead of params.id
    .single();

  if (!client) redirect("/admin/clients");

  const completedSessions = client.sessions?.filter(
    (s: any) => s.booking_status === "completed"
  ).length ?? 0;

  const totalPaid = client.payments
    ?.filter((p: any) => p.status === "paid")
    .reduce((s: number, p: any) => s + p.amount, 0) ?? 0;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/admin/clients"
        className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body">
        <ArrowLeft size={12} /> Back to clients
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-light text-ink mb-1">{client.full_name}</h1>
          <p className="text-muted text-sm font-body">
            Member since {formatDate(client.created_at)} ·{" "}
            {client.plan_type?.replace("_", " ")} ·{" "}
            {client.monthly_rate ? formatCurrency(client.monthly_rate) + "/mo" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {client.churn_risk_flag && (
            <span className="text-[10px] tracking-widest uppercase font-body bg-red-100 text-red-600 px-2 py-1">
              Churn risk
            </span>
          )}
          <Badge status={client.status} />
        </div>
      </div>

      <ClientStatusActions clientId={client.id} currentStatus={client.status} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-stone p-4 text-center">
          <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-1">Sessions</p>
          <p className="font-display text-2xl font-light text-ink">{completedSessions}</p>
        </div>
        <div className="bg-white border border-stone p-4 text-center">
          <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-1">Total Paid</p>
          <p className="font-display text-2xl font-light text-ink">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white border border-stone p-4 text-center">
          <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-1">Trainer</p>
          <p className="text-sm font-body text-ink">{client.trainers?.full_name ?? "Unassigned"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact info */}
        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Contact</p>
          {[
            { label: "Email",  value: client.email },
            { label: "Phone",  value: client.phone },
            { label: "City",   value: client.city },
            { label: "ZIP",    value: client.zip_code },
            { label: "Status", value: client.status?.replace(/_/g, " ") },
          ].map(f => f.value ? (
            <div key={f.label} className="grid grid-cols-2 gap-3 py-2.5 border-b border-stone last:border-0">
              <p className="text-xs text-muted font-body">{f.label}</p>
              <p className="text-xs text-ink font-body capitalize">{f.value}</p>
            </div>
          ) : null)}
        </Card>

        {/* Recent payments */}
        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Recent Payments</p>
          {client.payments?.slice(0, 5).map((p: any) => (
            <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-stone last:border-0">
              <div>
                <p className="text-xs font-body text-ink">{formatCurrency(p.amount)}</p>
                <p className="text-[10px] text-muted font-body">{formatDate(p.created_at)}</p>
              </div>
              <Badge status={p.status} />
            </div>
          ))}
          {!client.payments?.length && (
            <p className="text-muted text-xs font-body">No payments.</p>
          )}
        </Card>

        {/* Recent sessions */}
        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Recent Sessions</p>
          {client.sessions?.slice(0, 5).map((s: any) => (
            <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-stone last:border-0">
              <div>
                <p className="text-xs font-body text-ink">{formatDate(s.date_time)}</p>
                <p className="text-[10px] text-muted font-body capitalize">{s.session_type?.replace(/_/g, " ")}</p>
              </div>
              <Badge status={s.booking_status} />
            </div>
          ))}
          {!client.sessions?.length && (
            <p className="text-muted text-xs font-body">No sessions.</p>
          )}
        </Card>

        {/* Support tickets */}
        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Support Tickets</p>
          {client.support_tickets?.slice(0, 5).map((t: any) => (
            <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-stone last:border-0">
              <div>
                <p className="text-xs font-body text-ink capitalize">{t.category?.replace(/_/g, " ")}</p>
                <p className="text-[10px] text-muted font-body">{formatDate(t.created_at)}</p>
              </div>
              <Badge status={t.status} />
            </div>
          ))}
          {!client.support_tickets?.length && (
            <p className="text-muted text-xs font-body">No tickets.</p>
          )}
        </Card>
      </div>
    </div>
  );
}