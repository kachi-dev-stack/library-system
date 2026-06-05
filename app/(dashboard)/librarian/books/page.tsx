"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import BooksClient from "@/app/(dashboard)/admin/books/BooksClient";
import { librarianNav } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  role: string;
  full_name: string;
};

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
};

export default function LibrarianBooksPage() {
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

      if (profileData?.role !== "librarian") {
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

  const basePath = "/librarian";

  return (
    <DashboardLayout
      nav={librarianNav}
      roleLabel="Librarian"
      userName={profile?.full_name || "Librarian"}
      title="Books"
      subtitle="Manage your catalogue"
    >
      <BooksClient books={books} basePath={basePath} />
    </DashboardLayout>
  );
}
