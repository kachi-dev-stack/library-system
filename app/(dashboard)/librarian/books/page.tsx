import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import BooksClient from "@/app/(dashboard)/admin/books/BooksClient";
import { librarianNav } from "@/lib/nav-config";

export default async function LibrarianBooksPage() {
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

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <DashboardLayout
      nav={librarianNav}
      roleLabel="Librarian"
      userName={profile.full_name}
      title="Books"
      subtitle="Manage your catalogue"
    >
      <BooksClient books={books ?? []} basePath="/librarian" />
    </DashboardLayout>
  );
}
