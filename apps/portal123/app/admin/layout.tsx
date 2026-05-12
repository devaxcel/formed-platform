import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("admin_role")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <AdminSidebar
        userEmail={user.email ?? ""}
        adminRole={adminProfile?.admin_role ?? "support_admin"}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar
          userEmail={user.email ?? ""}
          adminRole={adminProfile?.admin_role ?? "support_admin"}
        />
        <main className="flex-1 overflow-y-auto bg-cream">
          {children}
        </main>
      </div>
    </div>
  );
}