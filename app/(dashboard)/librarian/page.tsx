import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StaffDashboard } from "@/components/modules/StaffDashboard";
import { librarianNav } from "@/lib/nav-config";

export default async function LibrarianDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "librarian") redirect("/login");

  return (
    <DashboardLayout
      nav={librarianNav}
      roleLabel="Librarian"
      userName={profile.full_name}
      title="Dashboard"
      subtitle="Library overview and quick navigation"
    >
      <StaffDashboard base="/librarian" />
    </DashboardLayout>
  );
}
