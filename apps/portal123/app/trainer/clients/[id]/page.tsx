import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import { ArrowLeft, Phone, Mail } from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients")
    .select(`
      *,
      client_intake(*),
      sessions(
        id, date_time, booking_status, session_type,
        notes_submitted, duration_minutes,
        session_notes(*)
      )
    `)
    .eq("id", params.id)
    .single();

  if (!client) redirect("/trainer/clients");

  const sessions = client.sessions ?? [];
  const now = new Date();

  const pastSessions = sessions
    .filter((s: any) => new Date(s.date_time) < now)
    .sort((a: any, b: any) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());

  const upcomingSessions = sessions
    .filter((s: any) => new Date(s.date_time) >= now)
    .sort((a: any, b: any) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());

  const nextSession = upcomingSessions[0];
  const sessionsNeedingNotes = pastSessions.filter(
    (s: any) => s.booking_status === "completed" && !s.notes_submitted
  );

  const intake = client.client_intake;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">

      {/* Back */}
      <Link
        href="/trainer/clients"
        className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body transition-colors"
      >
        <ArrowLeft size={12} /> Back to Clients
      </Link>

      {/* Client hero */}
      <div className="bg-ink p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-warm/20 flex items-center justify-center">
              <span className="font-display text-2xl font-light text-cream">
                {client.full_name?.[0]}
              </span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-light text-cream mb-1">
                {client.full_name}
              </h1>
              <p className="text-cream/60 text-sm font-body">
                {client.city} ·{" "}
                {client.plan_type?.replace("_", " ").replace("week", "/ week")}
              </p>
            </div>
          </div>
          {/* Status — Active instead of approved */}
          <span className={`text-[10px] tracking-widest uppercase font-body px-3 py-1.5 ${
            client.status === "active"
              ? "bg-green-900/40 text-green-300"
              : "bg-cream/10 text-cream/60"
          }`}>
            {client.status === "active" ? "Active" : client.status?.replace(/_/g, " ")}
          </span>
        </div>

        {/* Next session */}
        {nextSession ? (
          <div className="bg-cream/10 border border-cream/20 p-4 mb-4">
            <p className="text-[10px] tracking-widest uppercase text-warm/50 mb-2 font-body">
              Next Session
            </p>
            <p className="font-display text-xl font-light text-cream">
              {formatDate(nextSession.date_time)} at {formatTime(nextSession.date_time)}
            </p>
            <p className="text-cream/50 text-xs font-body mt-1 capitalize">
              {nextSession.session_type?.replace(/_/g, " ")} · {nextSession.duration_minutes ?? 60} min
            </p>
          </div>
        ) : (
          <div className="bg-cream/5 border border-cream/10 p-4 mb-4">
            <p className="text-cream/50 text-sm font-body">No upcoming session scheduled</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {sessionsNeedingNotes.length > 0 && (
            <Link
              href={`/trainer/notes/${sessionsNeedingNotes[0].id}`}
              className="text-[10px] tracking-widest uppercase font-body bg-amber-500 text-white px-5 py-2.5 hover:bg-amber-600 transition-colors"
            >
              Submit Notes ({sessionsNeedingNotes.length})
            </Link>
          )}
          <Link
            href="/trainer/schedule"
            className="text-[10px] tracking-widest uppercase font-body bg-cream/20 text-cream px-5 py-2.5 hover:bg-cream/30 transition-colors border border-cream/20"
          >
            View Schedule
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — contact + goals */}
        <div className="space-y-5">

          {/* Contact — interactive */}
          <Card>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">
              Contact
            </p>
            <div className="space-y-3">
              {client.email && (
                
                <a  href={`mailto:${client.email}`}
                  className="flex items-center gap-3 text-sm text-ink hover:text-muted transition-colors group"
                >
                  <Mail size={14} className="text-muted group-hover:text-ink transition-colors" />
                  <span className="font-body underline underline-offset-2">{client.email}</span>
                </a>
              )}
              {client.phone && (
                
                 <a href={`tel:${client.phone}`}
                  className="flex items-center gap-3 text-sm text-ink hover:text-muted transition-colors group"
                >
                  <Phone size={14} className="text-muted group-hover:text-ink transition-colors" />
                  <span className="font-body underline underline-offset-2">{client.phone}</span>
                </a>
              )}
              <div>
                <p className="text-[10px] text-muted font-body">City</p>
                <p className="text-sm text-ink font-body">{client.city}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted font-body">Plan</p>
                <p className="text-sm text-ink font-body capitalize">
                  {client.plan_type?.replace("_", " ")}
                </p>
              </div>
            </div>
          </Card>

          {/* Goals */}
          {intake && (
            <Card>
              <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">
                Goals & Health
              </p>
              <div className="space-y-4">
                {intake.primary_goals?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted font-body mb-2">Primary Goals</p>
                    <div className="flex flex-wrap gap-1">
                      {intake.primary_goals.map((g: string) => (
                        <span
                          key={g}
                          className="text-[10px] bg-ink text-cream px-2 py-0.5 font-body"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {intake.injuries && (
                  <div>
                    <p className="text-[10px] text-muted font-body mb-1">Injuries / Limitations</p>
                    <p className="text-sm text-ink font-body leading-relaxed">{intake.injuries}</p>
                  </div>
                )}
                {intake.training_history && (
                  <div>
                    <p className="text-[10px] text-muted font-body mb-1">Training History</p>
                    <p className="text-sm text-ink font-body leading-relaxed">{intake.training_history}</p>
                  </div>
                )}
                {intake.coaching_intensity && (
                  <div>
                    <p className="text-[10px] text-muted font-body mb-1">Coaching Intensity</p>
                    <p className="text-sm text-ink font-body">{intake.coaching_intensity}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right — sessions */}
        <div className="lg:col-span-2 space-y-6">

          {/* Upcoming */}
          <div>
            <SectionHeader title="Upcoming Sessions" />
            {upcomingSessions.length > 0 ? (
              <div className="space-y-2">
                {upcomingSessions.map((s: any) => (
                  <Card key={s.id} padding="sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-body font-medium text-ink">
                          {formatDate(s.date_time)}
                        </p>
                        <p className="text-xs text-muted font-body capitalize">
                          {formatTime(s.date_time)} ·{" "}
                          {s.session_type?.replace(/_/g, " ")} ·{" "}
                          {s.duration_minutes ?? 60} min
                        </p>
                      </div>
                      <span className={`text-[10px] tracking-widest uppercase font-body px-2.5 py-1 ${
                        s.booking_status === "paid" || s.booking_status === "admin_confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {s.booking_status === "paid" || s.booking_status === "admin_confirmed"
                          ? "Confirmed" : "Upcoming"}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card padding="sm">
                <p className="text-center text-muted text-sm font-body py-3">
                  No upcoming sessions.
                </p>
              </Card>
            )}
          </div>

          {/* Session history — clickable with add notes */}
          <div>
            <SectionHeader title="Session History" />
            {pastSessions.length > 0 ? (
              <div className="space-y-2">
                {pastSessions.slice(0, 8).map((s: any) => (
                  <div
                    key={s.id}
                    className="bg-white border border-stone hover:border-warm transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center w-10">
                          <p className="text-[10px] text-muted font-body uppercase">
                            {new Date(s.date_time).toLocaleDateString("en-US", { month: "short" })}
                          </p>
                          <p className="font-display text-xl font-light text-ink leading-none">
                            {new Date(s.date_time).getDate()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-body text-ink">{formatTime(s.date_time)}</p>
                          <p className="text-xs text-muted font-body capitalize">
                            {s.session_type?.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge status={s.booking_status} />
                        {s.booking_status === "completed" && !s.notes_submitted && (
                          <Link
                            href={`/trainer/notes/${s.id}`}
                            className="text-[10px] tracking-widest uppercase font-body bg-amber-500 text-white px-3 py-1.5 hover:bg-amber-600 transition-colors"
                          >
                            Add Notes
                          </Link>
                        )}
                        {s.notes_submitted && (
                          <span className="text-[10px] tracking-widest uppercase font-body text-green-600 bg-green-50 px-2.5 py-1">
                            Notes Done
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Session notes preview */}
                    {s.session_notes?.[0] && (
                      <div className="border-t border-stone px-4 py-3 grid grid-cols-2 gap-3">
                        {s.session_notes[0].wins_improvements && (
                          <div>
                            <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-1">
                              Key Wins
                            </p>
                            <p className="text-xs text-ink font-body leading-relaxed">
                              {s.session_notes[0].wins_improvements}
                            </p>
                          </div>
                        )}
                        {s.session_notes[0].next_session_focus && (
                          <div>
                            <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-1">
                              Next Session Plan
                            </p>
                            <p className="text-xs text-ink font-body leading-relaxed">
                              {s.session_notes[0].next_session_focus}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Card padding="sm">
                <p className="text-center text-muted text-sm font-body py-3">
                  No sessions completed yet.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}