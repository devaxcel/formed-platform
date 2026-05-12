import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import EmptyState from "@/components/portal/ui/EmptyState";
import PayNowButton from "@/components/portal/PayNowButton";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id, plan_type, monthly_rate, billing_status, stripe_customer_id, start_date")
    .eq("user_id", user.id)
    .single();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", client?.id ?? "")
    .order("created_at", { ascending: false });

  const pendingPayments = payments?.filter(p => p.status === "unpaid") ?? [];
  const recentPayments  = payments?.slice(0, 3) ?? [];
  const allPayments     = payments ?? [];

  // Calculate next billing date (approx 30 days from last payment or start date)
  const lastPaid = payments?.find(p => p.status === "paid");
  const nextBillingDate = lastPaid
    ? new Date(new Date(lastPaid.created_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  const planLabel =
    client?.plan_type === "3x_week" ? "3 sessions / week"
    : client?.plan_type === "2x_week" ? "2 sessions / week"
    : "1 session / week";

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">

      {/* Page title */}
      <div>
        <p className="text-[10px] tracking-widests uppercase text-muted font-body mb-1">
          Membership
        </p>
        <h1 className="font-display text-3xl font-light text-ink">
          Your Membership
        </h1>
      </div>

      {/* Payment due alert */}
      {pendingPayments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-5">
          <p className="font-body font-medium text-yellow-800 text-sm mb-1">
            Payment required
          </p>
          <p className="text-yellow-700 text-xs font-body leading-relaxed mb-4">
            {pendingPayments.length} session{pendingPayments.length > 1 ? "s" : ""} awaiting payment.
          </p>
          <div className="space-y-2">
            {pendingPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-4">
                <p className="text-sm font-body text-yellow-800">
                  {formatCurrency(p.amount)} — {formatDate(p.created_at)}
                </p>
                {p.session_id && <PayNowButton sessionId={p.session_id} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Membership overview — clean and premium */}
      <div className="bg-ink text-cream p-8 lg:p-10">
        <p className="text-[10px] tracking-widests uppercase text-warm/40 mb-6 font-body">
          Current Membership
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-cream/40 text-[10px] tracking-widests uppercase font-body mb-1">
              Plan
            </p>
            <p className="font-display text-2xl font-light text-cream">{planLabel}</p>
          </div>
          <div>
            <p className="text-cream/40 text-[10px] tracking-widests uppercase font-body mb-1">
              Monthly Rate
            </p>
            <p className="font-display text-2xl font-light text-cream">
              {client?.monthly_rate ? formatCurrency(client.monthly_rate) : "—"}
            </p>
          </div>
          <div>
            <p className="text-cream/40 text-[10px] tracking-widests uppercase font-body mb-1">
              Next Billing
            </p>
            <p className="font-display text-2xl font-light text-cream">
              {nextBillingDate
                ? nextBillingDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—"}
            </p>
          </div>
        </div>

        {/* Payment method */}
        <div className="border-t border-cream/10 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard size={16} className="text-cream/40" />
            <p className="text-cream/60 text-sm font-body">
              {client?.stripe_customer_id
                ? "Payment method on file"
                : "No payment method added"}
            </p>
          </div>
        </div>
      </div>

      {/* Membership actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard/support"
          className="flex-1 text-center text-[10px] tracking-widests uppercase font-body px-5 py-3.5 border border-stone hover:border-warm text-muted hover:text-ink transition-colors"
        >
          Request a Pause
        </Link>
        <Link
          href="/dashboard/support"
          className="flex-1 text-center text-[10px] tracking-widests uppercase font-body px-5 py-3.5 border border-stone hover:border-red-300 text-muted hover:text-red-600 transition-colors"
        >
          Cancel Membership
        </Link>
      </div>

      {/* Recent payments — minimal */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] tracking-widests uppercase text-muted font-body">
            Recent Payments
          </p>
        </div>

        {recentPayments.length > 0 ? (
          <>
            <div className="space-y-2">
              {recentPayments.map((p) => (
                <div key={p.id} className="bg-white border border-stone p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-body font-medium text-ink text-sm">
                      {formatCurrency(p.amount)}
                    </p>
                    <p className="text-xs text-muted font-body">{formatDate(p.created_at)}</p>
                  </div>
                  <Badge status={p.status} />
                </div>
              ))}
            </div>

            {/* View full history toggle */}
            {allPayments.length > 3 && (
              <details className="mt-4">
                <summary className="text-[10px] tracking-widests uppercase text-muted hover:text-ink font-body cursor-pointer py-2">
                  View full history ({allPayments.length} payments)
                </summary>
                <div className="space-y-2 mt-3">
                  {allPayments.slice(3).map((p) => (
                    <div key={p.id} className="bg-white border border-stone p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-body font-medium text-ink text-sm">
                          {formatCurrency(p.amount)}
                        </p>
                        <p className="text-xs text-muted font-body">
                          {formatDate(p.created_at)}
                          {p.failure_reason && (
                            <span className="text-red-500 ml-2">· {p.failure_reason}</span>
                          )}
                        </p>
                      </div>
                      <Badge status={p.status} />
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        ) : (
          <Card>
            <EmptyState
              icon={<CreditCard size={24} />}
              title="No payments yet"
              description="Your payment history will appear here."
            />
          </Card>
        )}
      </div>
    </div>
  );
}