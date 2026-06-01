import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import EmptyState from "@/components/portal/ui/EmptyState";
import NewTicketForm from "@/components/portal/NewTicketForm";
import { MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select(`*, ticket_replies(*)`)
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Support"
        subtitle="Get help with scheduling, billing, or your trainer"
      />

      {/* New ticket form */}
      <Card>
        <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">
          Submit a Request
        </p>
        <NewTicketForm userId={user.id} userRole="client" />
      </Card>

      {/* Existing tickets */}
      <div>
        <SectionHeader title="My Requests" />
        {tickets && tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div>
                    <p className="font-body font-medium text-ink text-sm capitalize">
                      {ticket.subject ?? ticket.category?.replace(/_/g, " ")}
                    </p>
                    <p className="text-muted text-xs font-body mt-0.5">
                      {formatDate(ticket.created_at)} · {ticket.category?.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Badge status={ticket.status} />
                </div>

                <p className="text-muted text-sm font-body leading-relaxed border-t border-stone pt-3">
                  {ticket.message}
                </p>

                {/* Replies */}
                {ticket.ticket_replies?.length > 0 && (
                  <div className="mt-4 space-y-3 border-t border-stone pt-4">
                    <p className="text-[10px] tracking-widest uppercase text-muted font-body">
                      Replies ({ticket.ticket_replies.length})
                    </p>
                    {ticket.ticket_replies.map((reply: any) => (
                      <div key={reply.id} className="bg-stone p-3">
                        <p className="text-xs font-body text-ink leading-relaxed">{reply.message}</p>
                        <p className="text-[10px] text-muted font-body mt-1">{formatDate(reply.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<MessageSquare size={28} />}
              title="No requests yet"
              description="Submit a request above for any scheduling, billing, or trainer questions."
            />
          </Card>
        )}
      </div>
    </div>
  );
}