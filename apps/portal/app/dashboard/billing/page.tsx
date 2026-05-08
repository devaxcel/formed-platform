import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Badge from "@/components/portal/ui/Badge";
import EmptyState from "@/components/portal/ui/EmptyState";
import PayNowButton from "@/components/portal/PayNowButton";
import Link from "next/link";
import { CreditCard, Calendar, TrendingUp, User, ArrowUpRight } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import MembershipActions from "@/components/portal/MembershipActions";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id, plan_type, monthly_rate, billing_status, stripe_customer_id, start_date, assigned_trainer_id, full_name")
    .eq("user_id", user.id)
    .single();

  const { data: trainerData } = client?.assigned_trainer_id ? await supabase
    .from("trainers").select("full_name").eq("id", client.assigned_trainer_id).single()
    : { data: null };

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false });

  // Next upcoming session
  const { data: nextSessionArr } = await supabase
    .from("sessions")
    .select("date_time, booking_status")
    .eq("client_id", client?.id ?? "")
    .in("booking_status", ["admin_confirmed", "paid", "trainer_accepted"])
    .gte("date_time", new Date().toISOString())
    .order("date_time", { ascending: true })
    .limit(1);

  const nextSession = nextSessionArr?.[0];

  // Sessions this month
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count: sessionsThisMonth } = await supabase
    .from("sessions").select("*", { count: "exact", head: true })
    .eq("client_id", client?.id ?? "").eq("booking_status", "completed").gte("date_time", startOfMonth);

  const sessionsPerMonth =
    client?.plan_type === "3x_week" ? 12 :
    client?.plan_type === "2x_week" ? 8 : 4;

  const pendingPayments = payments?.filter(p => p.status === "unpaid") ?? [];
  const lastPaid = payments?.find(p => p.status === "paid");
  const nextBillingDate = lastPaid
    ? new Date(new Date(lastPaid.created_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  const planLabel =
    client?.plan_type === "3x_week" ? "3 sessions / week" :
    client?.plan_type === "2x_week" ? "2 sessions / week" : "1 session / week";

  const plans = [
    { key: "1x_week", label: "Starter",     sessions: "1x / week",  price: "$520",   monthly: 520,  best: "Consistency" },
    { key: "2x_week", label: "Performance", sessions: "2x / week",  price: "$980",   monthly: 980,  best: "Faster results", highlight: true },
    { key: "3x_week", label: "Elite",       sessions: "3x / week",  price: "$1,380", monthly: 1380, best: "Maximum accountability" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-1">Membership</p>
        <h1 className="font-display text-3xl font-light text-ink">Your Membership</h1>
      </div>

      {/* Payment due alert */}
      {pendingPayments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-5">
          <p className="font-body font-medium text-yellow-800 text-sm mb-1">Payment required</p>
          <p className="text-yellow-700 text-xs font-body leading-relaxed mb-4">
            {pendingPayments.length} session{pendingPayments.length > 1 ? "s" : ""} awaiting payment.
          </p>
          <div className="space-y-2">
            {pendingPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-4">
                <p className="text-sm font-body text-yellow-800">{formatCurrency(p.amount)} — {formatDate(p.created_at)}</p>
                {p.session_id && <PayNowButton sessionId={p.session_id} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium membership overview */}
      <div className="bg-ink text-cream p-8 lg:p-10">
        <p className="text-[10px] tracking-widests uppercase text-warm/40 mb-6 font-body">Current Membership</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-cream/40 text-[10px] tracking-widests uppercase font-body mb-1">Plan</p>
            <p className="font-display text-2xl font-light text-cream">{planLabel}</p>
          </div>
          <div>
            <p className="text-cream/40 text-[10px] tracking-widests uppercase font-body mb-1">Monthly Rate</p>
            <p className="font-display text-2xl font-light text-cream">
              {client?.monthly_rate ? formatCurrency(client.monthly_rate) : "—"}
            </p>
          </div>
          <div>
            <p className="text-cream/40 text-[10px] tracking-widests uppercase font-body mb-1">Next Billing</p>
            <p className="font-display text-2xl font-light text-cream">
              {nextBillingDate ? nextBillingDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        {/* Quick info strip */}
        <div className="border-t border-cream/10 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Calendar size={14} className="text-cream/40" />
            <div>
              <p className="text-cream/40 text-[10px] font-body">Next Session</p>
              <p className="text-cream text-sm font-body">
                {nextSession
                  ? new Date(nextSession.date_time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
                  : "None scheduled"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp size={14} className="text-cream/40" />
            <div>
              <p className="text-cream/40 text-[10px] font-body">Sessions This Month</p>
              <p className="text-cream text-sm font-body">{sessionsThisMonth ?? 0} / {sessionsPerMonth} completed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User size={14} className="text-cream/40" />
            <div>
              <p className="text-cream/40 text-[10px] font-body">Your Trainer</p>
              <p className="text-cream text-sm font-body">{trainerData?.full_name ?? "Not yet assigned"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard size={14} className="text-cream/40" />
            <div>
              <p className="text-cream/40 text-[10px] font-body">Auto-Pay</p>
              <p className="text-cream text-sm font-body">
                {client?.stripe_customer_id ? "Active — card on file" : "No payment method"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Membership plan comparison + actions */}
      <MembershipActions currentPlan={client?.plan_type ?? "1x_week"} plans={plans} clientId={client?.id} />

      {/* Payment history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] tracking-widests uppercase text-muted font-body">Payment History</p>
        </div>
        {payments && payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="bg-white border border-stone p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-body font-medium text-ink text-sm">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted font-body">{formatDate(p.created_at)}</p>
                  {p.failure_reason && <p className="text-red-500 text-xs font-body">{p.failure_reason}</p>}
                  {p.status === "refunded" && p.refunded_amount && (
                    <p className="text-xs text-muted font-body">Refunded: {formatCurrency(p.refunded_amount)}</p>
                  )}
                </div>
                <Badge status={p.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-stone p-8 text-center">
            <CreditCard size={24} className="text-muted mx-auto mb-3" />
            <p className="text-muted text-sm font-body">No payment history yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
