import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import AdminTicketActions from "@/components/admin/AdminTicketActions";
import { formatDate } from "@/lib/utils";

export default async function AdminTicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select(`*, ticket_replies(*), submitted_user:submitted_by(email)`)
    .order("created_at", { ascending: false });

  const open = tickets?.filter(t => t.status === "open" || t.status === "in_progress") ?? [];
  const resolved = tickets?.filter(t => t.status === "resolved" || t.status === "escalated") ?? [];

  const renderTicket = (t: any) => (
    <Card key={t.id}>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-body font-medium text-ink text-sm capitalize">
              {t.subject ?? t.category?.replace(/_/g, " ")}
            </p>
            <span className={`text-[10px] tracking-widths uppercase font-body px-1.5 py-0.5 ${
              t.priority === "urgent" ? "bg-red-100 text-red-600" :
              t.priority === "high"   ? "bg-orange-100 text-orange-600" :
              "bg-stone text-muted"
            }`}>
              {t.priority}
            </span>
          </div>
          <p className="text-xs text-muted font-body">
            {t.submitted_user?.email} · {t.submitted_by_role} ·{" "}
            {formatDate(t.created_at)}
          </p>
        </div>
        <Badge status={t.status} />
      </div>

      <p className="text-sm text-muted font-body leading-relaxed mb-4 border-t border-stone pt-3">
        {t.message}
      </p>

      {t.ticket_replies?.length > 0 && (
        <div className="space-y-2 mb-4">
          {t.ticket_replies.map((r: any) => (
            <div key={r.id} className="bg-stone p-3">
              <p className="text-xs font-body text-ink leading-relaxed">{r.message}</p>
              <p className="text-[10px] text-muted font-body mt-1">{formatDate(r.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      <AdminTicketActions ticketId={t.id} currentStatus={t.status} />
    </Card>
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Support Tickets"
        subtitle={`${open.length} open · ${resolved.length} resolved`}
      />

      <div>
        <p className="text-[10px] tracking-widets uppercase text-muted mb-3 font-body">
          Open ({open.length})
        </p>
        <div className="space-y-3">
          {open.length > 0 ? open.map(renderTicket) : (
            <Card><p className="text-center text-muted text-sm font-body py-6">No open tickets.</p></Card>
          )}
        </div>
      </div>

      {resolved.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widets uppercase text-muted mb-3 font-body">
            Resolved ({resolved.length})
          </p>
          <div className="space-y-3 opacity-60">
            {resolved.slice(0, 5).map(renderTicket)}
          </div>
        </div>
      )}
    </div>
  );
}