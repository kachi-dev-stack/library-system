import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StaffDashboard } from "@/components/modules/StaffDashboard";
import { adminNav } from "@/lib/nav-config";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/login");

  return (
    <DashboardLayout
      nav={adminNav}
      roleLabel="Administrator"
      userName={profile.full_name}
      title="Dashboard"
      subtitle="Library overview and quick navigation"
    >
      <StaffDashboard base="/admin" />
    </DashboardLayout>
  );
}
