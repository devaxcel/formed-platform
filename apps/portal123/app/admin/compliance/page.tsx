import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import { formatDate } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

export default async function CompliancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now     = new Date();
  const in30    = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const in7     = new Date(now.getTime() + 7  * 24 * 60 * 60 * 1000).toISOString();

  const { data: expiring30 } = await supabase
    .from("trainer_docs")
    .select(`*, trainers(full_name)`)
    .lte("expiry_date", in30)
    .gt("expiry_date", now.toISOString())
    .order("expiry_date", { ascending: true });

  const { data: expiring7 } = await supabase
    .from("trainer_docs")
    .select(`*, trainers(full_name)`)
    .lte("expiry_date", in7)
    .gt("expiry_date", now.toISOString())
    .order("expiry_date", { ascending: true });

  const { data: expired } = await supabase
    .from("trainer_docs")
    .select(`*, trainers(full_name)`)
    .lt("expiry_date", now.toISOString())
    .order("expiry_date", { ascending: false })
    .limit(20);

  const sections = [
    { title: "Expired",         docs: expired ?? [],    urgency: "red" },
    { title: "Expiring in 7 days", docs: expiring7 ?? [], urgency: "orange" },
    { title: "Expiring in 30 days", docs: expiring30 ?? [], urgency: "yellow" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Compliance Center"
        subtitle="Track trainer document and certification expiry"
      />

      {sections.map(section => (
        <div key={section.title}>
          <div className="flex items-center gap-3 mb-3">
            {section.docs.length > 0 && (
              <ShieldAlert size={14} className={
                section.urgency === "red" ? "text-red-500" :
                section.urgency === "orange" ? "text-orange-500" : "text-yellow-500"
              } />
            )}
            <p className={`text-[10px] tracking-widest uppercase font-body ${
              section.urgency === "red" ? "text-red-600" :
              section.urgency === "orange" ? "text-orange-600" : "text-yellow-600"
            }`}>
              {section.title} ({section.docs.length})
            </p>
          </div>

          {section.docs.length > 0 ? (
            <div className="space-y-2">
              {section.docs.map((doc: any) => (
                <Card key={doc.id} padding="sm"
                  className={`border-l-2 ${
                    section.urgency === "red" ? "border-l-red-400" :
                    section.urgency === "orange" ? "border-l-orange-400" : "border-l-yellow-400"
                  }`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-body font-medium text-ink">
                        {doc.trainers?.full_name}
                      </p>
                      <p className="text-xs text-muted font-body capitalize">
                        {doc.doc_type?.replace(/_/g, " ")} ·{" "}
                        Expires {formatDate(doc.expiry_date)}
                      </p>
                    </div>
                    <Badge status={doc.approval_status} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="sm">
              <p className="text-center text-muted text-xs font-body py-2">None — all clear.</p>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}