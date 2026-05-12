import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const STATUS_FILTERS = [
  "all", "submitted", "under_review", "approved",
  "waitlisted", "rejected", "onboarding", "ready_for_match", "active"
];

export default async function ClientApplicationsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>  // ✅ Fix: Make it a Promise
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // ✅ Fix: Await searchParams to get the value
  const { status: statusParam } = await searchParams;
  const status = statusParam ?? "submitted";

  let query = supabase
    .from("clients")
    .select("id, full_name, email, city, zip_code, plan_type, status, created_at, source")
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);

  const { data: clients } = await query;

  const { data: counts } = await supabase
    .from("clients")
    .select("status");

  const countByStatus = counts?.reduce((acc: Record<string, number>, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Client Applications"
        subtitle={`${clients?.length ?? 0} applications`}
      />

      {/* Status filters */}
      <div className="flex gap-1 flex-wrap border-b border-stone pb-0">
        {STATUS_FILTERS.map(s => (
          <Link
            key={s}
            href={`/admin/applications/clients?status=${s}`}
            className={`px-3 py-2 text-[10px] tracking-widest uppercase font-body transition-colors border-b-2 -mb-px ${
              status === s
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {s.replace(/_/g, " ")}
            {s !== "all" && countByStatus[s] ? (
              <span className="ml-1 text-[9px]">({countByStatus[s]})</span>
            ) : null}
          </Link>
        ))}
      </div>

      {/* Applications table */}
      {clients && clients.length > 0 ? (
        <div className="space-y-2">
          {clients.map((client) => (
            <Link key={client.id} href={`/admin/applications/clients/${client.id}`}>
              <Card className="hover:border-warm transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-stone flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-ink text-base font-light">
                        {client.full_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-body font-medium text-ink text-sm">{client.full_name}</p>
                      <p className="text-muted text-xs font-body">
                        {client.email} · {client.city} · {client.plan_type?.replace("_", " ")}
                      </p>
                      {client.source && (
                        <p className="text-[10px] text-muted font-body">
                          Source: {client.source}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-muted font-body">{formatDate(client.created_at)}</p>
                    <Badge status={client.status} />
                    <ChevronRight size={14} className="text-muted" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-center text-muted text-sm font-body py-8">
            No {status !== "all" ? status.replace(/_/g, " ") : ""} applications.
          </p>
        </Card>
      )}
    </div>
  );
}