import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils";

export default async function AdminCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now     = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`*, clients(full_name), trainers(full_name)`)
    .gte("date_time", now.toISOString())
    .lte("date_time", weekEnd.toISOString())
    .order("date_time", { ascending: true });

  // Group by day
  const grouped: Record<string, any[]> = {};
  sessions?.forEach(s => {
    const day = new Date(s.date_time).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric"
    });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(s);
  });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <SectionHeader
        title="Schedule Calendar"
        subtitle="Sessions over the next 7 days"
      />

      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([day, daySessions]) => (
          <div key={day}>
            <p className="text-[10px] tracking-widests uppercase text-muted mb-3 font-body">{day}</p>
            <div className="space-y-2">
              {daySessions.map((s) => (
                <Card key={s.id} padding="sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-cream w-10 h-10 flex items-center justify-center border border-stone flex-shrink-0">
                        <span className="font-display text-sm font-light text-ink">
                          {formatTime(s.date_time).replace(" AM","a").replace(" PM","p")}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-body font-medium text-ink">
                          {s.clients?.full_name}
                        </p>
                        <p className="text-xs text-muted font-body">
                          {s.trainers?.full_name} · {s.session_type?.replace(/_/g," ")}
                        </p>
                      </div>
                    </div>
                    <Badge status={s.booking_status} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <Card>
          <p className="text-center text-muted text-sm font-body py-8">
            No sessions scheduled in the next 7 days.
          </p>
        </Card>
      )}
    </div>
  );
}