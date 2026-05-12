import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import { formatDate } from "@/lib/utils";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <SectionHeader title="Notifications Center" />

      <div className="space-y-2">
        {notifications?.map((n) => (
          <Card key={n.id} padding="sm"
            className={!n.is_read ? "border-l-2 border-l-ink" : ""}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-body font-medium text-ink text-sm">{n.title}</p>
                {n.message && (
                  <p className="text-muted text-xs font-body mt-0.5 leading-relaxed">{n.message}</p>
                )}
                <p className="text-[10px] text-muted font-body mt-1">{formatDate(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <span className="w-2 h-2 bg-ink rounded-full flex-shrink-0 mt-1" />
              )}
            </div>
          </Card>
        ))}

        {(!notifications || notifications.length === 0) && (
          <Card>
            <p className="text-center text-muted text-sm font-body py-8">No notifications.</p>
          </Card>
        )}
      </div>
    </div>
  );
}