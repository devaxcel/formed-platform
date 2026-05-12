import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import OnboardingModuleManager from "@/components/admin/OnboardingModuleManager";

export default async function ContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: modules } = await supabase
    .from("onboarding_modules")
    .select("*")
    .order("order_index", { ascending: true });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <SectionHeader
        title="Onboarding Content"
        subtitle="Manage trainer onboarding modules"
      />
      <OnboardingModuleManager modules={modules ?? []} />
    </div>
  );
}