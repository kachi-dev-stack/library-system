import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReportsClient from "@/app/(dashboard)/admin/reports/ReportsClient";

export default async function LibrarianReportsPage() {
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

  const [
    { data: loans },
    { data: topBooks },
    { data: overdueLoans },
    { data: allActiveLoans },
  ] = await Promise.all([
    supabase
      .from("borrow_records")
      .select(
        "id, member_id, status, borrowed_at, due_date, returned_at, fine_amount, member:profiles!borrow_records_member_id_fkey(full_name), book:books!borrow_records_book_id_fkey(title)",
      )
      .order("borrowed_at", { ascending: false })
      .limit(100),
    supabase
      .from("borrow_records")
      .select("book_id, book:books!borrow_records_book_id_fkey(title, author)")
      .limit(200),
    supabase
      .from("borrow_records")
      .select(
        "id, due_date, fine_amount, member:profiles!borrow_records_member_id_fkey(full_name, email), book:books!borrow_records_book_id_fkey(title)",
      )
      .eq("status", "overdue")
      .order("due_date", { ascending: true }),
    supabase
      .from("borrow_records")
      .select(
        "id, member_id, due_date, returned_at, status, member:profiles!borrow_records_member_id_fkey(full_name, email), book:books!borrow_records_book_id_fkey(title)",
      )
      .eq("status", "active"),
  ]);

  return (
    <ReportsClient
      loans={(loans ?? []) as any}
      topBooks={(topBooks ?? []) as any}
      overdueLoans={(overdueLoans ?? []) as any}
      activeLoans={(allActiveLoans ?? []) as any}
    />
  );
}
