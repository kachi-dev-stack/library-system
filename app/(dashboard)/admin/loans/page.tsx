"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import LoansClient from "./LoansClient";
import { adminNav, librarianNav } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  role: string;
  full_name: string;
};

type Loan = {
  id: string;
  status: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  fine_amount: number;
  member: { full_name: string; email: string };
  book: { title: string; author: string };
};

type Book = {
  id: string;
  title: string;
  author: string;
  available_copies: number;
};

type Member = {
  id: string;
  full_name: string;
  email: string;
};

export default function LoansPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
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

      const { data: booksData } = await supabase
        .from("books")
        .select("id, title, author, available_copies")
        .order("title");

      const { data: membersData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "member")
        .eq("status", "active");

      const { data: loansData } = await supabase
        .from("borrow_records")
        .select(
          `
          id, status, borrowed_at, due_date, returned_at, fine_amount,
          member:profiles!borrow_records_member_id_fkey(full_name, email),
          book:books!borrow_records_book_id_fkey(title, author)
        `,
        )
        .order("borrowed_at", { ascending: false });

      setProfile(profileData);
      setBooks(booksData || []);
      setMembers(membersData || []);

      // Type assertion with a more explicit approach
      const typedLoans: Loan[] = (loansData as any) || [];
      setLoans(typedLoans);

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
      title="Loans"
      subtitle="Issue and return books"
    >
      <LoansClient books={books} members={members} loans={loans} />
    </DashboardLayout>
  );
}
