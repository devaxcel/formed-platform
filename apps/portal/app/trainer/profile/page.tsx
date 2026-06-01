import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import { formatDate } from "@/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

export default async function TrainerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: trainer } = await supabase
    .from("trainers")
    .select(`*, trainer_docs(*)`)
    .eq("user_id", user.id)
    .single();

  const docs = trainer?.trainer_docs ?? [];

  // Profile completion score
  const completionFields = [
    !!trainer?.full_name,
    !!trainer?.phone,
    !!trainer?.city,
    !!trainer?.short_bio,
    (trainer?.specialties?.length ?? 0) > 0,
    (trainer?.certifications?.length ?? 0) > 0,
    !!trainer?.coaching_style,
    !!trainer?.headshot_url,
    docs.length > 0,
  ];
  const completionScore = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  // Check for expiring docs
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiredDocs  = docs.filter((d: any) => d.expiry_date && new Date(d.expiry_date) < now);
  const expiringDocs = docs.filter((d: any) =>
    d.expiry_date &&
    new Date(d.expiry_date) >= now &&
    new Date(d.expiry_date) <= in30
  );

  const tierLabel = trainer?.tier?.replace(/_/g, " ") ?? "Certified Trainer";

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">

      {/* Profile hero */}
      <div className="bg-ink p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-warm/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {trainer?.headshot_url ? (
                <img
                  src={trainer.headshot_url}
                  alt={trainer.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display text-2xl font-light text-cream">
                  {trainer?.full_name?.[0]}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-light text-cream mb-1">
                {trainer?.full_name}
              </h1>
              {/* Status + tier — prominent */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] tracking-widests uppercase font-body px-3 py-1.5 ${
                  trainer?.status === "active"
                    ? "bg-green-900/40 text-green-300"
                    : trainer?.status === "restricted"
                    ? "bg-red-900/40 text-red-300"
                    : "bg-cream/10 text-cream/60"
                }`}>
                  {trainer?.status === "active" ? "Active" :
                   trainer?.status?.replace(/_/g, " ") ?? "Pending"}
                </span>
                <span className="text-[10px] tracking-widests uppercase font-body bg-warm/20 text-warm px-3 py-1.5 capitalize">
                  {tierLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Edit profile button */}
          
          <a  href="mailto:hello@formed.fit?subject=Profile Update Request"
            className="text-[10px] tracking-widests uppercase font-body border border-cream/30 text-cream/60 hover:text-cream hover:border-cream transition-colors px-4 py-2 flex-shrink-0"
          >
            Request Update
          </a>
        </div>

        {/* Profile completion */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-widests uppercase text-cream/40 font-body">
              Profile Strength
            </p>
            <p className="text-[10px] text-cream/60 font-body">{completionScore}%</p>
          </div>
          <div className="h-1 bg-cream/10">
            <div
              className={`h-1 transition-all duration-700 ${
                completionScore >= 80 ? "bg-green-400" :
                completionScore >= 50 ? "bg-warm" : "bg-red-400"
              }`}
              style={{ width: `${completionScore}%` }}
            />
          </div>
          {completionScore < 100 && (
            <p className="text-[10px] text-cream/40 font-body mt-1">
              {!trainer?.headshot_url && "Add a profile photo · "}
              {!trainer?.short_bio && "Add your bio · "}
              {!trainer?.coaching_style && "Add your coaching style"}
            </p>
          )}
        </div>
      </div>

      {/* Compliance alerts */}
      {(expiredDocs.length > 0 || expiringDocs.length > 0) && (
        <div className="space-y-2">
          {expiredDocs.map((d: any) => (
            <div key={d.id} className="bg-red-50 border border-red-200 p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-body font-medium text-red-800">
                    Expired: {d.doc_type?.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-red-600 font-body">
                    Expired on {formatDate(d.expiry_date)} — upload a renewed version to stay active.
                  </p>
                </div>
              </div>
              
               <a href="mailto:hello@formed.fit?subject=Document Update"
                className="flex-shrink-0 text-[10px] tracking-widests uppercase font-body bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition-colors"
              >
                Update Now
              </a>
            </div>
          ))}
          {expiringDocs.map((d: any) => {
            const daysLeft = Math.floor((new Date(d.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={d.id} className="bg-yellow-50 border border-yellow-200 p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-body font-medium text-yellow-800">
                      Expiring in {daysLeft} day{daysLeft !== 1 ? "s" : ""}: {d.doc_type?.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-yellow-700 font-body">
                      Expires {formatDate(d.expiry_date)} — renew soon to avoid interruption.
                    </p>
                  </div>
                </div>
                
                <a  href="mailto:hello@formed.fit?subject=Document Update"
                  className="flex-shrink-0 text-[10px] tracking-widests uppercase font-body border border-yellow-400 text-yellow-700 px-4 py-2 hover:bg-yellow-100 transition-colors"
                >
                  Update
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Personal info */}
      <Card>
        <p className="text-[10px] tracking-widests uppercase text-muted mb-5 font-body">
          Personal Information
        </p>
        <div className="space-y-0 border-t border-stone">
          {[
            { label: "Full Name",     value: trainer?.full_name },
            { label: "Email",         value: user.email },
            { label: "Phone",         value: trainer?.phone },
            { label: "City",          value: trainer?.city },
            { label: "Experience",    value: trainer?.experience_years ? `${trainer.experience_years} years` : null },
            { label: "Max Clients",   value: trainer?.max_active_clients },
            { label: "Coaching Style", value: trainer?.coaching_style },
            { label: "Member Since",  value: trainer?.created_at ? formatDate(trainer.created_at) : null },
          ].map(f => f.value ? (
            <div key={f.label} className="grid grid-cols-2 gap-4 py-3.5 border-b border-stone last:border-0">
              <p className="text-xs text-muted font-body">{f.label}</p>
              <p className="text-sm text-ink font-body capitalize">{String(f.value)}</p>
            </div>
          ) : null)}
        </div>
        <p className="text-xs text-muted font-body mt-4">
          To update your profile, email{" "}
          <a href="mailto:hello@formed.fit" className="text-ink underline underline-offset-2">
            hello@formed.fit
          </a>{" "}
          or submit a support ticket.
        </p>
      </Card>

      {/* Specialties — emphasis */}
      {trainer?.specialties?.length > 0 && (
        <Card>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">
            Specialties
          </p>
          <div className="flex flex-wrap gap-2">
            {trainer.specialties.map((s: string) => (
              <span key={s}
                className="text-xs bg-ink text-cream px-4 py-2 font-body font-medium">
                {s}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Certifications */}
      {trainer?.certifications?.length > 0 && (
        <Card>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">
            Certifications
          </p>
          <div className="flex flex-wrap gap-2">
            {trainer.certifications.map((c: string) => (
              <span key={c}
                className="text-xs bg-stone text-muted px-3 py-1.5 font-body border border-stone">
                {c}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Bio */}
      {trainer?.short_bio && (
        <Card>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-3 font-body">Bio</p>
          <p className="text-sm text-ink font-body leading-relaxed">{trainer.short_bio}</p>
        </Card>
      )}

      {/* Documents */}
      <Card>
        <div className="flex items-start justify-between mb-5">
          <p className="text-[10px] tracking-widests uppercase text-muted font-body">
            Documents & Compliance
          </p>
          
          <a  href="mailto:hello@formed.fit?subject=Document Upload"
            className="text-[10px] tracking-widests uppercase font-body text-muted hover:text-ink transition-colors"
          >
            Submit Document →
          </a>
        </div>

        {docs.length > 0 ? (
          <div className="space-y-0 border-t border-stone">
            {docs.map((doc: any) => {
              const isExpired  = doc.expiry_date && new Date(doc.expiry_date) < now;
              const isExpiring = doc.expiry_date && new Date(doc.expiry_date) >= now && new Date(doc.expiry_date) <= in30;

              return (
                <div key={doc.id} className="grid grid-cols-3 gap-4 py-3.5 border-b border-stone last:border-0">
                  <p className="text-xs font-body text-ink capitalize">
                    {doc.doc_type?.replace(/_/g, " ")}
                  </p>
                  <p className={`text-xs font-body ${
                    isExpired ? "text-red-500 font-medium" :
                    isExpiring ? "text-yellow-600 font-medium" :
                    "text-muted"
                  }`}>
                    {doc.expiry_date ? `Expires ${formatDate(doc.expiry_date)}` : "No expiry"}
                    {isExpired && " — EXPIRED"}
                    {isExpiring && " — Expiring soon"}
                  </p>
                  <div className="flex items-center gap-2">
                    {isExpired ? (
                      <AlertCircle size={13} className="text-red-500" />
                    ) : (
                      <CheckCircle size={13} className="text-green-500" />
                    )}
                    <span className={`text-[10px] tracking-widests uppercase font-body ${
                      doc.approval_status === "valid"
                        ? "text-green-600"
                        : doc.approval_status === "expired"
                        ? "text-red-500"
                        : "text-muted"
                    }`}>
                      {doc.approval_status?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted text-sm font-body">
            No documents uploaded yet. Contact{" "}
            <a href="mailto:hello@formed.fit" className="text-ink underline underline-offset-2">
              hello@formed.fit
            </a>{" "}
            to submit your certification, CPR/AED, insurance, and ID.
          </p>
        )}
      </Card>
    </div>
  );
}