"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import ReportsClient from "./ReportsClient";
import { adminNav, librarianNav } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  role: string;
  full_name: string;
};

export default function ReportsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (!["admin", "librarian"].includes(profileData?.role)) {
        router.push("/login");
        return;
      }

      const { data: loansData } = await supabase
        .from("borrow_records")
        .select(
          `
          id, member_id, status, borrowed_at, due_date, returned_at, fine_amount,
          member:profiles!borrow_records_member_id_fkey(full_name),
          book:books!borrow_records_book_id_fkey(title)
        `,
        )
        .order("borrowed_at", { ascending: false })
        .limit(100);

      const { data: topBooksData } = await supabase
        .from("borrow_records")
        .select(
          "book_id, book:books!borrow_records_book_id_fkey(title, author)",
        )
        .limit(200);

      const { data: overdueLoansData } = await supabase
        .from("borrow_records")
        .select(
          `
          id, due_date, fine_amount,
          member:profiles!borrow_records_member_id_fkey(full_name, email),
          book:books!borrow_records_book_id_fkey(title)
        `,
        )
        .eq("status", "overdue")
        .order("due_date", { ascending: true });

      const { data: activeLoansData } = await supabase
        .from("borrow_records")
        .select(
          `
          id, member_id, due_date, returned_at, status,
          member:profiles!borrow_records_member_id_fkey(full_name, email),
          book:books!borrow_records_book_id_fkey(title)
        `,
        )
        .eq("status", "active");

      setProfile(profileData);
      setLoans(loansData || []);
      setTopBooks(topBooksData || []);
      setOverdueLoans(overdueLoansData || []);
      setActiveLoans(activeLoansData || []);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";
  const nav = isAdmin ? adminNav : librarianNav;
  const roleLabel = isAdmin ? "Administrator" : "Librarian";

  return (
    <DashboardLayout
      nav={nav}
      roleLabel={roleLabel}
      userName={profile?.full_name || "User"}
      title="Reports"
      subtitle="Stats, risk detection and history"
    >
      <ReportsClient
        loans={loans}
        topBooks={topBooks}
        overdueLoans={overdueLoans}
        activeLoans={activeLoans}
      />
    </DashboardLayout>
  );
}
