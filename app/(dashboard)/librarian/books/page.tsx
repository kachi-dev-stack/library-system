import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BooksClient from "@/app/(dashboard)/admin/books/BooksClient";

export default async function LibrarianBooksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "librarian") redirect("/login");

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  return <BooksClient books={books ?? []} backUrl="/librarian" />;
}
