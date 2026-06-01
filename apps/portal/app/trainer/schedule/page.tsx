import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ScheduleClient from "@/components/trainer/ScheduleClient";

export default async function TrainerSchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: trainer } = await supabase
    .from("trainers").select("id").eq("user_id", user.id).single();

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`*, clients(full_name, city, plan_type)`)
    .eq("trainer_id", trainer?.id ?? "")
    .gte("date_time", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("date_time", { ascending: true });

  return <ScheduleClient sessions={sessions ?? []} accessToken="" />;
}