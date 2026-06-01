import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TrainerOnboardingClient from "@/components/trainer/TrainerOnboardingClient";

export default async function TrainerOnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: trainer } = await supabase
    .from("trainers").select("id, status").eq("user_id", user.id).single();

  const { data: modules } = await supabase
    .from("onboarding_modules")
    .select("*")
    .order("order_index", { ascending: true });

  const { data: progress } = await supabase
    .from("trainer_module_progress")
    .select("*")
    .eq("trainer_id", trainer?.id ?? "");

  return (
    <TrainerOnboardingClient
      trainerId={trainer?.id ?? ""}
      modules={modules ?? []}
      progress={progress ?? []}
    />
  );
}