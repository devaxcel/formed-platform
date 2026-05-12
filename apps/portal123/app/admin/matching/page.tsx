import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import MatchingEngine from "@/components/admin/MatchingEngine";

export default async function MatchingCenterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: unmatchedClients } = await supabase
    .from("clients")
    .select(`*, client_intake(*)`)
    .eq("status", "ready_for_match")
    .order("created_at", { ascending: true });

  const { data: activeTrainers } = await supabase
    .from("trainers")
    .select(`*, trainer_availability(*)`)
    .eq("status", "active")
    .order("tier", { ascending: false });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Matching Center"
        subtitle={`${unmatchedClients?.length ?? 0} client${unmatchedClients?.length !== 1 ? "s" : ""} awaiting match`}
      />

      {unmatchedClients && unmatchedClients.length > 0 ? (
        <MatchingEngine
          clients={unmatchedClients}
          trainers={activeTrainers ?? []}
        />
      ) : (
        <Card>
          <p className="text-center text-muted text-sm font-body py-12">
            All clients are currently matched.
          </p>
        </Card>
      )}
    </div>
  );
}