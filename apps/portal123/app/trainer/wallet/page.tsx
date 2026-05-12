import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import EmptyState from "@/components/portal/ui/EmptyState";
import PayoutRequestButton from "@/components/trainer/PayoutRequestButton";
import { DollarSign, TrendingUp } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function TrainerWalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, payout_rate, full_name, max_active_clients, current_client_count")
    .eq("user_id", user.id)
    .single();

  const { data: payouts } = await supabase
    .from("payouts")
    .select(`*, sessions(date_time, session_type), clients(full_name)`)
    .eq("trainer_id", trainer?.id ?? "")
    .order("created_at", { ascending: false });

  const { data: eligible } = await supabase
    .from("sessions")
    .select(`*, clients(full_name)`)
    .eq("trainer_id", trainer?.id ?? "")
    .eq("booking_status", "completed")
    .eq("notes_submitted", true)
    .eq("payout_status", "pending");

  // Earnings calculations
  const rate           = trainer?.payout_rate ?? 0;
  const lifetimeEarned = payouts?.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0) ?? 0;
  const approved       = payouts?.filter(p => p.status === "approved").reduce((s, p) => s + p.amount, 0) ?? 0;
  const requested      = payouts?.filter(p => p.status === "requested").reduce((s, p) => s + p.amount, 0) ?? 0;
  const pendingEarned  = (eligible?.length ?? 0) * rate;

  // This week/month earnings
  const now            = new Date();
  const startOfWeek    = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
  const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1);

  const weekEarnings   = payouts?.filter(p => p.status === "paid" && new Date(p.paid_at) >= startOfWeek).reduce((s, p) => s + p.amount, 0) ?? 0;
  const monthEarnings  = payouts?.filter(p => p.status === "paid" && new Date(p.paid_at) >= startOfMonth).reduce((s, p) => s + p.amount, 0) ?? 0;

  // Earnings potential
  const spotsLeft      = (trainer?.max_active_clients ?? 10) - (trainer?.current_client_count ?? 0);
  const weeklyPotential = (trainer?.current_client_count ?? 0) * 2 * rate; // assumes 2x/week avg

  const totalEligible  = (eligible?.length ?? 0) * rate;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <SectionHeader title="Wallet" subtitle="Your earnings and payout history" />

      {/* Hero earnings strip */}
      <div className="bg-ink p-8">
        <p className="text-[10px] tracking-widests uppercase text-warm/40 mb-6 font-body">
          Earnings Overview
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "This Week",          value: formatCurrency(weekEarnings) },
            { label: "This Month",         value: formatCurrency(monthEarnings) },
            { label: "Upcoming Earnings",  value: formatCurrency(pendingEarned),  sub: `${eligible?.length ?? 0} sessions ready` },
            { label: "Lifetime Earnings",  value: formatCurrency(lifetimeEarned), sub: "all time" },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] tracking-widests uppercase text-cream/40 font-body mb-1">
                {item.label}
              </p>
              <p className="font-display text-2xl font-light text-cream">{item.value}</p>
              {item.sub && (
                <p className="text-cream/40 text-xs font-body mt-0.5">{item.sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* Session rate */}
        <div className="mt-6 pt-6 border-t border-cream/10">
          <p className="text-cream/40 text-xs font-body">
            Your rate: <span className="text-cream font-medium">{formatCurrency(rate)}</span> per session ·
            Processing time: <span className="text-cream">1–2 business days</span> after approval
          </p>
        </div>
      </div>

      {/* Pending payout status */}
      {(requested > 0 || approved > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {requested > 0 && (
            <Card>
              <p className="text-[10px] tracking-widests uppercase text-muted mb-1 font-body">Requested</p>
              <p className="font-display text-2xl font-light text-ink">{formatCurrency(requested)}</p>
              <p className="text-xs text-muted font-body mt-1">Awaiting admin approval</p>
            </Card>
          )}
          {approved > 0 && (
            <Card>
              <p className="text-[10px] tracking-widests uppercase text-muted mb-1 font-body">Approved</p>
              <p className="font-display text-2xl font-light text-green-700">{formatCurrency(approved)}</p>
              <p className="text-xs text-muted font-body mt-1">Processing — 1–2 business days</p>
            </Card>
          )}
        </div>
      )}

      {/* Request payout */}
      {eligible && eligible.length > 0 && (
        <Card>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">
            Ready to Request ({eligible.length} session{eligible.length > 1 ? "s" : ""})
          </p>
          <div className="space-y-2 mb-5">
            {eligible.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 py-2 border-b border-stone last:border-0">
                <div>
                  <p className="text-sm font-body text-ink">{s.clients?.full_name}</p>
                  <p className="text-xs text-muted font-body">
                    {s.date_time
                      ? new Date(s.date_time).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"} ·{" "}
                    <span className="capitalize">{s.session_type?.replace(/_/g, " ")}</span>
                  </p>
                </div>
                <p className="text-sm font-body font-medium text-ink">
                  {formatCurrency(rate)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-sm font-body font-medium text-ink">
              Total: {formatCurrency(totalEligible)}
            </p>
            <PayoutRequestButton
              trainerId={trainer!.id}
              sessions={eligible}
              payoutRate={rate}
            />
          </div>
        </Card>
      )}

      {/* Earnings potential */}
      {spotsLeft > 0 && (
        <Card>
          <div className="flex items-start gap-4">
            <TrendingUp size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-body font-medium text-ink text-sm mb-1">
                Earnings Potential
              </p>
              <p className="text-muted text-xs font-body leading-relaxed">
                You have <strong>{spotsLeft} open spot{spotsLeft > 1 ? "s" : ""}</strong>.
                With {trainer?.current_client_count ?? 0} client{(trainer?.current_client_count ?? 0) !== 1 ? "s" : ""} at 2 sessions/week,
                you could earn approximately{" "}
                <strong>{formatCurrency(weeklyPotential)}/week</strong>.
                Fill your remaining spots to maximize earnings.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Payout history */}
      <div>
        <SectionHeader title="Payout History" />
        {payouts && payouts.length > 0 ? (
          <div className="space-y-2">
            {payouts.map((p) => (
              <Card key={p.id} padding="sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-body font-medium text-ink">
                      {p.clients?.full_name} — {formatCurrency(p.amount)}
                    </p>
                    <p className="text-xs text-muted font-body">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric"
                          })
                        : "—"}
                      {p.sessions?.session_type && (
                        <span className="capitalize ml-2">
                          · {p.sessions.session_type.replace(/_/g, " ")}
                        </span>
                      )}
                      {p.status === "rejected" && p.dispute_reason && (
                        <span className="text-red-500 ml-2">· {p.dispute_reason}</span>
                      )}
                    </p>
                  </div>
                  {/* Clear status labels */}
                  <span className={`text-[10px] tracking-widests uppercase font-body px-2.5 py-1 ${
                    p.status === "paid"      ? "bg-green-100 text-green-700" :
                    p.status === "approved"  ? "bg-blue-100 text-blue-700" :
                    p.status === "requested" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {p.status === "requested" ? "Pending Approval" :
                     p.status === "approved"  ? "Approved — Processing" :
                     p.status === "paid"      ? "Paid" : "Rejected"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<DollarSign size={28} />}
              title="No payout history yet"
              description="Complete sessions, submit notes, and request your first payout."
            />
          </Card>
        )}
      </div>
    </div>
  );
}