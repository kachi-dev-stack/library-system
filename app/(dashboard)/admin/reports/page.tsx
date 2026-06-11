import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import ReportsClient from "./ReportsClient";
import { adminNav, librarianNav } from "@/lib/nav-config";

export default async function ReportsPage() {
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

  const [
    { data: loans },
    { data: topBooks },
    { data: overdueLoans },
    { data: activeLoans },
  ] = await Promise.all([
    supabase
      .from("borrow_records")
      .select(
        `
      id, member_id, status, borrowed_at, due_date, returned_at, fine_amount,
      member:profiles!borrow_records_member_id_fkey(full_name),
      book:books!borrow_records_book_id_fkey(title)
    `,
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
        `
      id, due_date, fine_amount,
      member:profiles!borrow_records_member_id_fkey(full_name, email),
      book:books!borrow_records_book_id_fkey(title)
    `,
      )
      .eq("status", "overdue")
      .order("due_date", { ascending: true }),
    supabase
      .from("borrow_records")
      .select(
        `
      id, member_id, due_date, returned_at, status,
      member:profiles!borrow_records_member_id_fkey(full_name, email),
      book:books!borrow_records_book_id_fkey(title)
    `,
      )
      .eq("status", "active"),
  ]);

  const isAdmin = profile?.role === "admin";

  return (
    <DashboardLayout
      nav={isAdmin ? adminNav : librarianNav}
      roleLabel={isAdmin ? "Administrator" : "Librarian"}
      userName={profile?.full_name || ""}
      title="Reports"
      subtitle="Stats, risk detection and history"
    >
      <ReportsClient
        loans={(loans ?? []) as any}
        topBooks={(topBooks ?? []) as any}
        overdueLoans={(overdueLoans ?? []) as any}
        activeLoans={(activeLoans ?? []) as any}
      />
    </DashboardLayout>
  );
}
