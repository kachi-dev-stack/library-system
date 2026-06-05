"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import BooksClient from "./BooksClient";
import { adminNav, librarianNav } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  total_copies: number;
  available_copies: number;
  published_year: number;
  created_at: string;
};

type Profile = {
  role: string;
  full_name: string;
};

export default function BooksPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
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
        .select("*")
        .order("created_at", { ascending: false });

      setProfile(profileData);
      setBooks(booksData || []);
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
  const basePath = `/${profile?.role}`;

  return (
    <DashboardLayout
      nav={nav}
      roleLabel={roleLabel}
      userName={profile?.full_name || "User"}
      title="Books"
      subtitle="Manage your catalogue"
    >
      <BooksClient books={books} basePath={basePath} />
    </DashboardLayout>
  );
}
