import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/portal/Sidebar";
import TopBar from "@/components/portal/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Get client profile
  const { data: profile } = await supabase
    .from("clients")
    .select(`
      id, full_name, status, plan_type,
      assigned_trainer_id,
      trainers:assigned_trainer_id (
        id, full_name, headshot_url, short_bio, specialties
      )
    `)
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <Sidebar profile={profile} userEmail={user.email ?? ""} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar profile={profile} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}