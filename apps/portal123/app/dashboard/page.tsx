import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import { Calendar, ChevronRight, Clock, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients")
    .select(`
      *,
      trainers:assigned_trainer_id (
        id, full_name, short_bio, headshot_url, specialties, certifications
      ),
      client_onboarding (
        membership_agreement_signed, liability_waiver_signed,
        auto_bill_authorized, health_intake_completed, payment_method_on_file
      )
    `)
    .eq("user_id", user.id)
    .single();

  // Next upcoming session
  const { data: upcomingSessions } = await supabase
    .from("sessions")
    .select(`*, trainers(full_name)`)
    .eq("client_id", client?.id ?? "")
    .in("booking_status", ["admin_confirmed", "trainer_accepted", "payment_pending", "paid"])
    .gte("date_time", new Date().toISOString())
    .order("date_time", { ascending: true })
    .limit(3);

  // Session stats this month
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count: sessionsThisMonth } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("client_id", client?.id ?? "")
    .eq("booking_status", "completed")
    .gte("date_time", startOfMonth);

  const sessionsPerMonth =
    client?.plan_type === "3x_week" ? 12 :
    client?.plan_type === "2x_week" ? 8 : 4;

  // Onboarding
  const ob = Array.isArray(client?.client_onboarding)
    ? client?.client_onboarding[0]
    : client?.client_onboarding;

  const onboardingSteps = ob ? [
    ob.membership_agreement_signed,
    ob.liability_waiver_signed,
    ob.auto_bill_authorized,
    ob.health_intake_completed,
    ob.payment_method_on_file,
  ] : [];
  const completedSteps = onboardingSteps.filter(Boolean).length;
  const onboardingComplete = completedSteps === 5;

  const nextSession = upcomingSessions?.[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = client?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-full bg-cream">

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <div className="bg-ink px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-cream/50 text-[10px] tracking-widest uppercase font-body mb-2">
            {greeting}
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-light text-cream mb-6">
            {firstName}.
          </h1>

          {nextSession ? (
            <div className="bg-cream/10 border border-cream/20 p-6 lg:p-8 mb-6">
              <p className="text-[10px] tracking-widest uppercase text-warm/60 mb-4 font-body">
                Next Session
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-display text-2xl font-light text-cream mb-1">
                    {formatDate(nextSession.date_time)}
                  </p>
                  <p className="text-cream/60 text-sm font-body">
                    {formatTime(nextSession.date_time)} · with{" "}
                    {nextSession.trainers?.full_name ?? "Your Trainer"} ·{" "}
                    <span className="capitalize">
                      {nextSession.session_type?.replace(/_/g, " ")}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  {nextSession.booking_status === "payment_pending" && (
                    <Link
                      href="/dashboard/billing"
                      className="bg-warm text-ink text-[10px] tracking-widest uppercase font-body px-5 py-2.5 hover:bg-stone transition-colors"
                    >
                      Pay Now
                    </Link>
                  )}
                  <Link
                    href="/dashboard/sessions"
                    className="bg-cream/20 text-cream text-[10px] tracking-widest uppercase font-body px-5 py-2.5 hover:bg-cream/30 transition-colors border border-cream/20"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-cream/5 border border-cream/10 p-6 mb-6">
              <p className="text-cream/50 text-sm font-body mb-3">
                No upcoming sessions scheduled.
              </p>
              <Link
                href="/dashboard/book"
                className="inline-flex items-center gap-2 bg-cream text-ink text-[10px] tracking-widest uppercase font-body px-6 py-3 hover:bg-stone transition-colors"
              >
                Schedule Your Next Session <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* Primary CTA */}
          <Link
            href="/dashboard/book"
            className="inline-flex items-center gap-2 bg-cream text-ink text-[10px] tracking-widest uppercase font-body px-8 py-4 hover:bg-stone transition-colors"
          >
            Schedule Your Next Session <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── ONBOARDING BANNER ─────────────────────────────────────────── */}
      {!onboardingComplete && client && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 lg:px-8 py-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-amber-800 text-sm font-body font-medium">
                Complete your setup — {completedSteps} of 5 steps done
              </p>
              <div className="mt-2 h-1 bg-amber-200 w-48">
                <div
                  className="h-1 bg-amber-600 transition-all"
                  style={{ width: `${(completedSteps / 5) * 100}%` }}
                />
              </div>
            </div>
            <Link
              href="/dashboard/onboarding"
              className="text-[10px] tracking-widest uppercase font-body text-amber-800 border border-amber-400 px-5 py-2 hover:bg-amber-100 transition-colors"
            >
              Continue Setup
            </Link>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 space-y-10">

        {/* Session progress this month */}
        <div className="bg-white border border-stone p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted font-body mb-1">
                This Month
              </p>
              <p className="font-display text-3xl font-light text-ink">
                {sessionsThisMonth ?? 0}
                <span className="text-muted text-xl"> / {sessionsPerMonth} sessions</span>
              </p>
            </div>
            <Link
              href="/dashboard/sessions"
              className="text-[10px] tracking-widests uppercase text-muted hover:text-ink font-body flex items-center gap-1"
            >
              View all <ChevronRight size={10} />
            </Link>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-stone">
            <div
              className="h-1.5 bg-ink transition-all duration-700"
              style={{
                width: `${Math.min(
                  ((sessionsThisMonth ?? 0) / sessionsPerMonth) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <p className="text-muted text-xs font-body mt-2">
            {sessionsPerMonth - (sessionsThisMonth ?? 0) > 0
              ? `${sessionsPerMonth - (sessionsThisMonth ?? 0)} sessions remaining this month`
              : "All sessions completed this month"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Your Trainer */}
          <div className="lg:col-span-1">
            <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">
              Your Trainer
            </p>
            {client?.trainers ? (
              <div className="bg-white border border-stone p-6">
                {/* Trainer photo */}
                <div className="w-16 h-16 bg-stone mb-4 overflow-hidden">
                  {client.trainers.headshot_url ? (
                    <img
                      src={client.trainers.headshot_url}
                      alt={client.trainers.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-2xl text-muted font-light">
                        {client.trainers.full_name?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                <p className="font-display text-xl font-light text-ink mb-1">
                  {client.trainers.full_name}
                </p>
                {client.trainers.short_bio && (
                  <p className="text-muted text-xs font-body leading-relaxed mb-3 line-clamp-2">
                    {client.trainers.short_bio}
                  </p>
                )}
                {client.trainers.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {client.trainers.specialties.slice(0, 3).map((s: string) => (
                      <span
                        key={s}
                        className="text-[10px] bg-stone text-muted px-2 py-0.5 font-body"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-stone p-6 text-center">
                <p className="text-muted text-sm font-body">
                  {onboardingComplete
                    ? "You'll be matched with a trainer shortly."
                    : "Complete your setup to get matched."}
                </p>
                {!onboardingComplete && (
                  <Link
                    href="/dashboard/onboarding"
                    className="inline-block mt-3 text-[10px] tracking-widests uppercase font-body text-ink underline"
                  >
                    Complete Setup
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Upcoming sessions */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] tracking-widests uppercase text-muted font-body">
                Upcoming Sessions
              </p>
              <Link
                href="/dashboard/sessions"
                className="text-[10px] tracking-widests uppercase text-muted hover:text-ink font-body flex items-center gap-1"
              >
                View all <ChevronRight size={10} />
              </Link>
            </div>

            {upcomingSessions && upcomingSessions.length > 0 ? (
              <div className="space-y-2">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="bg-white border border-stone p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-cream w-12 h-12 flex flex-col items-center justify-center border border-stone flex-shrink-0">
                          <span className="text-[10px] font-body text-muted uppercase">
                            {new Date(session.date_time).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="font-display text-xl font-light text-ink leading-none">
                            {new Date(session.date_time).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-body text-sm font-medium text-ink">
                            {formatTime(session.date_time)}
                          </p>
                          <p className="text-muted text-xs font-body">
                            with {session.trainers?.full_name ?? "Your Trainer"} ·{" "}
                            <span className="capitalize">
                              {session.session_type?.replace(/_/g, " ")}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] tracking-widests uppercase font-body px-2.5 py-1 ${
                            session.booking_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : session.booking_status === "payment_pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {session.booking_status === "admin_confirmed"
                            ? "Confirmed"
                            : session.booking_status === "paid"
                            ? "Confirmed"
                            : session.booking_status === "payment_pending"
                            ? "Payment Due"
                            : session.booking_status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  href="/dashboard/book"
                  className="flex items-center justify-center gap-2 border border-dashed border-stone py-4 text-[10px] tracking-widests uppercase text-muted hover:text-ink hover:border-warm transition-colors font-body"
                >
                  <Calendar size={12} /> Request Another Session
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-stone p-8 text-center">
                <Clock size={24} className="text-warm mx-auto mb-3" />
                <p className="font-display text-lg font-light text-ink mb-2">
                  No upcoming sessions
                </p>
                <p className="text-muted text-xs font-body mb-5">
                  Schedule your next training session with your trainer.
                </p>
                <Link
                  href="/dashboard/book"
                  className="inline-flex items-center gap-2 bg-ink text-cream text-[10px] tracking-widests uppercase font-body px-6 py-3 hover:bg-accent transition-colors"
                >
                  Schedule Training
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}