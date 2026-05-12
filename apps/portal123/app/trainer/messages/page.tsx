import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import { formatDate } from "@/lib/utils";
import { Bell, Info } from "lucide-react";

export default async function TrainerMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: messages } = await supabase
    .from("messages")
    .select(`*, sender:sender_id(email)`)
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <SectionHeader
        title="Messages"
        subtitle="Communications from FORMED and your clients"
      />

      {/* FORMED Updates / Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-[10px] tracking-widests uppercase text-muted font-body">
            FORMED Updates
          </p>
          {unreadCount > 0 && (
            <span className="bg-ink text-cream text-[9px] font-body px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`border p-4 transition-all ${
                  !n.is_read
                    ? "bg-white border-ink/20 border-l-2 border-l-ink"
                    : "bg-white border-stone"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Bell size={14} className="text-muted flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-body font-medium text-ink text-sm">{n.title}</p>
                      {n.message && (
                        <p className="text-muted text-xs font-body mt-1 leading-relaxed">
                          {n.message}
                        </p>
                      )}
                      <p className="text-[10px] text-muted font-body mt-2">
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 bg-ink rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="py-6 text-center">
              <Bell size={24} className="text-warm mx-auto mb-3" />
              <p className="font-display text-lg font-light text-ink mb-1">
                No updates yet
              </p>
              <p className="text-muted text-sm font-body leading-relaxed">
                Updates from FORMED and your clients will appear here — approvals, alerts, and announcements.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Direct messages */}
      <div>
        <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">
          Direct Messages
        </p>

        {messages && messages.length > 0 ? (
          <div className="space-y-2">
            {messages.map((msg) => (
              <Card
                key={msg.id}
                className={!msg.is_read ? "border-l-2 border-l-ink" : ""}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-xs text-muted font-body">{msg.sender?.email}</p>
                  <p className="text-xs text-muted font-body flex-shrink-0">
                    {formatDate(msg.created_at)}
                  </p>
                </div>
                <p className="text-sm text-ink font-body leading-relaxed">{msg.content}</p>
                {!msg.is_read && (
                  <span className="text-[10px] tracking-widests uppercase font-body text-ink mt-2 block">
                    New
                  </span>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="py-6">
              <div className="flex items-start gap-3 mb-5">
                <Info size={16} className="text-muted flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-body font-medium text-ink text-sm mb-1">
                    Client messaging coming soon
                  </p>
                  <p className="text-muted text-xs font-body leading-relaxed">
                    Direct messaging with your clients is on the roadmap. For now, coordinate
                    through the FORMED operations team via support tickets.
                  </p>
                </div>
              </div>
              <div className="border-t border-stone pt-4">
                <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-2">
                  In the meantime
                </p>
                <p className="text-xs text-muted font-body">
                  Use session notes to communicate with clients · Contact FORMED ops at hello@formed.fit
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}