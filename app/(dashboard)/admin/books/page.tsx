import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import BooksClient from "./BooksClient";
import { adminNav, librarianNav } from "@/lib/nav-config";

export default async function BooksPage() {
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

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  const isAdmin = profile?.role === "admin";

  return (
    <DashboardLayout
      nav={isAdmin ? adminNav : librarianNav}
      roleLabel={isAdmin ? "Administrator" : "Librarian"}
      userName={profile?.full_name || ""}
      title="Books"
      subtitle="Manage your catalogue"
    >
      <BooksClient books={books ?? []} basePath={`/${profile?.role}`} />
    </DashboardLayout>
  );
}
