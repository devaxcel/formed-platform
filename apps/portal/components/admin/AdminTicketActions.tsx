"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminTicketActions({
  ticketId, currentStatus
}: { ticketId: string; currentStatus: string }) {
  const supabase = createClient();
  const router   = useRouter();
  const [reply,   setReply]   = useState("");
  const [loading, setLoading] = useState(false);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("ticket_replies").insert({
      ticket_id: ticketId, sender_id: user?.id, message: reply,
    });
    await supabase.from("support_tickets").update({
      status: "in_progress", updated_at: new Date().toISOString(),
    }).eq("id", ticketId);

    setReply("");
    setLoading(false);
    router.refresh();
  };

  const closeTicket = async () => {
    await supabase.from("support_tickets").update({
      status: "resolved", resolved_at: new Date().toISOString(),
    }).eq("id", ticketId);
    router.refresh();
  };

  return (
    <div className="space-y-3 border-t border-stone pt-3">
      <textarea
        rows={2}
        className="w-full border-b border-stone bg-transparent text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors font-body resize-none"
        placeholder="Reply to this ticket..."
        value={reply}
        onChange={e => setReply(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={sendReply}
          disabled={loading || !reply.trim()}
          className="text-[10px] tracking-widests uppercase font-body bg-ink text-cream px-5 py-2 hover:bg-accent transition-colors disabled:opacity-50">
          {loading ? "Sending..." : "Send Reply"}
        </button>
        {currentStatus !== "resolved" && (
          <button
            onClick={closeTicket}
            className="text-[10px] tracking-widests uppercase font-body bg-stone text-muted px-5 py-2 hover:bg-warm transition-colors">
            Close Ticket
          </button>
        )}
      </div>
    </div>
  );
}