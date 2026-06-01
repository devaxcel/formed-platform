import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import TrainerStatusActions from "@/components/admin/TrainerStatusActions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function TrainerApplicationDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>  // ✅ Fix: Make it a Promise
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // ✅ Fix: Await params to get the id
  const { id: trainerId } = await params;

  const { data: trainer } = await supabase
    .from("trainers")
    .select(`*, trainer_docs(*), trainer_module_progress(*, onboarding_modules(*))`)
    .eq("id", trainerId)  // ✅ Use trainerId instead of params.id
    .single();

  if (!trainer) redirect("/admin/applications/trainers");

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/admin/applications/trainers"
        className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted hover:text-ink font-body transition-colors">
        <ArrowLeft size={12} /> Back
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-light text-ink mb-1">{trainer.full_name}</h1>
          <p className="text-muted text-sm font-body">Applied {formatDate(trainer.created_at)}</p>
        </div>
        <Badge status={trainer.status} />
      </div>

      <TrainerStatusActions trainerId={trainer.id} currentStatus={trainer.status} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Professional Info</p>
          {[
            { label: "Email",         value: trainer.email },
            { label: "Phone",         value: trainer.phone },
            { label: "City",          value: trainer.city },
            { label: "Experience",    value: trainer.experience_years ? `${trainer.experience_years} years` : null },
            { label: "Tier",          value: trainer.tier?.replace(/_/g, " ") },
            { label: "Payout Rate",   value: trainer.payout_rate ? `$${trainer.payout_rate}` : null },
            { label: "Max Clients",   value: trainer.max_active_clients },
          ].map(f => f.value ? (
            <div key={f.label} className="grid grid-cols-2 gap-3 py-2.5 border-b border-stone last:border-0">
              <p className="text-xs text-muted font-body">{f.label}</p>
              <p className="text-xs text-ink font-body capitalize">{String(f.value)}</p>
            </div>
          ) : null)}
        </Card>

        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Specialties & Certs</p>
          {trainer.specialties?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-muted font-body mb-2">Specialties</p>
              <div className="flex flex-wrap gap-1">
                {trainer.specialties.map((s: string) => (
                  <span key={s} className="text-[10px] bg-stone text-muted px-2 py-0.5 font-body">{s}</span>
                ))}
              </div>
            </div>
          )}
          {trainer.certifications?.length > 0 && (
            <div>
              <p className="text-[10px] text-muted font-body mb-2">Certifications</p>
              <div className="flex flex-wrap gap-1">
                {trainer.certifications.map((c: string) => (
                  <span key={c} className="text-[10px] bg-stone text-muted px-2 py-0.5 font-body">{c}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">Documents</p>
        {trainer.trainer_docs?.length > 0 ? (
          <div className="space-y-0 border-t border-stone">
            {trainer.trainer_docs.map((doc: any) => (
              <div key={doc.id} className="grid grid-cols-3 gap-4 py-3 border-b border-stone last:border-0">
                <p className="text-xs font-body text-ink capitalize">{doc.doc_type?.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted font-body">
                  {doc.expiry_date ? `Expires ${formatDate(doc.expiry_date)}` : "No expiry"}
                </p>
                <Badge status={doc.approval_status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-xs font-body">No documents uploaded.</p>
        )}
      </Card>

      {/* Bio */}
      {trainer.short_bio && (
        <Card>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">Bio</p>
          <p className="text-sm text-ink font-body leading-relaxed">{trainer.short_bio}</p>
        </Card>
      )}
    </div>
  );
}