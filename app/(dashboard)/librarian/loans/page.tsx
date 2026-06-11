import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import LoansClient from "@/app/(dashboard)/admin/loans/LoansClient";
import { librarianNav } from "@/lib/nav-config";

export default async function LibrarianLoansPage() {
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

  const [{ data: books }, { data: members }, { data: loans }] =
    await Promise.all([
      supabase
        .from("books")
        .select("id, title, author, available_copies")
        .order("title"),
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "member")
        .eq("status", "active"),
      supabase
        .from("borrow_records")
        .select(
          `
      id, status, borrowed_at, due_date, returned_at, fine_amount,
      member:profiles!borrow_records_member_id_fkey(full_name, email),
      book:books!borrow_records_book_id_fkey(title, author)
    `,
        )
        .order("borrowed_at", { ascending: false }),
    ]);

  return (
    <DashboardLayout
      nav={librarianNav}
      roleLabel="Librarian"
      userName={profile?.full_name || ""}
      title="Loans"
      subtitle="Issue and return books"
    >
      <LoansClient
        books={(books ?? []) as any}
        members={(members ?? []) as any}
        loans={(loans ?? []) as any}
      />
    </DashboardLayout>
  );
}
