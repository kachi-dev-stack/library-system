import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import MembersClient from "./MembersClient";
import { adminNav, librarianNav } from "@/lib/nav-config";

export default async function MembersPage() {
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

  if (!["admin", "librarian"].includes(profile?.role)) redirect("/login");

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "member")
    .order("created_at", { ascending: false });

  const isAdmin = profile?.role === "admin";

  return (
    <DashboardLayout
      nav={isAdmin ? adminNav : librarianNav}
      roleLabel={isAdmin ? "Administrator" : "Librarian"}
      userName={profile?.full_name || ""}
      title="Members"
      subtitle="Manage member accounts"
    >
      <MembersClient members={members ?? []} />
    </DashboardLayout>
  );
}
