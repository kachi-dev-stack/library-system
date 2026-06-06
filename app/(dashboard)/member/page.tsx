"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NotificationBell } from "@/components/NotificationBell";
import { BookCover } from "@/components/BookCover";
import { memberNav } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";
import {
  BookOpen,
  Sparkles,
  History,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Profile = {
  full_name: string;
  email: string;
  status: string;
};

type Loan = {
  id: string;
  status: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  fine_amount: number;
  book: { id: string; title: string; author: string; category: string };
};

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  available_copies: number;
};

const coverGradients = [
  "bg-gradient-to-br from-amber-600 to-orange-700",
  "bg-gradient-to-br from-emerald-600 to-teal-700",
  "bg-gradient-to-br from-blue-600 to-indigo-700",
  "bg-gradient-to-br from-rose-600 to-pink-700",
  "bg-gradient-to-br from-purple-600 to-violet-700",
  "bg-gradient-to-br from-slate-600 to-gray-700",
  "bg-gradient-to-br from-cyan-600 to-blue-700",
  "bg-gradient-to-br from-lime-600 to-green-700",
  "bg-gradient-to-br from-fuchsia-600 to-purple-700",
  "bg-gradient-to-br from-amber-600 to-yellow-700",
];

function getBookGradient(title: string): string {
  const index = title.length % coverGradients.length;
  return coverGradients[index];
}

export default function MemberDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [topCategories, setTopCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspended, setSuspended] = useState(false);

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
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData?.role !== "member") {
        router.push("/login");
        return;
      }

      if (profileData?.status === "suspended") {
        setSuspended(true);
        setLoading(false);
        return;
      }

      const { data: loansData } = await supabase
        .from("borrow_records")
        .select(
          "id, status, borrowed_at, due_date, returned_at, fine_amount, book:books!borrow_records_book_id_fkey(id, title, author, category)",
        )
        .eq("member_id", user.id)
        .order("borrowed_at", { ascending: false });

      const { data: allBooks } = await supabase
        .from("books")
        .select("id, title, author, category, available_copies")
        .gt("available_copies", 0);

      const categoryCount: Record<string, number> = {};
      const borrowedBookIds = new Set<string>();

      loansData?.forEach((loan) => {
        const book = loan.book as any;
        if (book?.category) {
          categoryCount[book.category] =
            (categoryCount[book.category] || 0) + 1;
        }
        if (book?.id) borrowedBookIds.add(book.id);
      });

      const topCats = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

      let recommendedBooks = (allBooks ?? [])
        .filter(
          (b) => !borrowedBookIds.has(b.id) && topCats.includes(b.category),
        )
        .slice(0, 5);

      if (recommendedBooks.length === 0) {
        recommendedBooks = (allBooks ?? [])
          .filter((b) => !borrowedBookIds.has(b.id))
          .slice(0, 5);
      }

      setProfile(profileData);
      setLoans((loansData as any) || []);
      setRecommendations(recommendedBooks);
      setTopCategories(topCats);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const activeLoans = loans.filter((l) => l.status === "active");
  const overdueLoans = loans.filter(
    (l) => l.status === "active" && new Date(l.due_date) < new Date(),
  );
  const returnedLoans = loans.filter((l) => l.status === "returned");

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

  if (suspended) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-4xl mb-4">🚫</p>
          <h2 className="font-serif text-xl font-bold text-danger mb-2">
            Account Suspended
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your library account has been suspended. Please contact the
            librarian for assistance.
          </p>
          <a
            href="/api/auth/signout"
            className="text-sm text-danger hover:underline"
          >
            Sign out
          </a>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout
      nav={memberNav}
      roleLabel="Member"
      userName={profile?.full_name || "Member"}
      title="My Library"
      subtitle="Your borrowed books and recommendations"
      headerExtra={<NotificationBell />}
    >
      <div className="space-y-8">
        {overdueLoans.length > 0 && (
          <Card className="border-danger/40 bg-danger/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-danger" />
              <div>
                <p className="text-sm font-semibold text-danger">
                  {overdueLoans.length} overdue book
                  {overdueLoans.length > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-danger/80 mt-0.5">
                  Please return them as soon as possible. Fine: ₦50/day.
                </p>
              </div>
            </div>
          </Card>
        )}

        <section>
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Currently borrowed
            </h2>
          </div>
          {activeLoans.length === 0 ? (
            <Card className="grid place-items-center gap-2 p-12 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                No books currently borrowed.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activeLoans.map((loan) => {
                const isOverdue = new Date(loan.due_date) < new Date();
                const daysLeft = Math.ceil(
                  (new Date(loan.due_date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                return (
                  <Card
                    key={loan.id}
                    className="flex gap-4 p-4"
                    style={{ boxShadow: "var(--shadow-soft)" }}
                  >
                    <BookCover
                      title={loan.book?.title || "Unknown"}
                      author={loan.book?.author}
                      cover={getBookGradient(loan.book?.title || "Unknown")}
                      className="w-20 shrink-0"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="font-serif text-base font-semibold text-foreground">
                        {loan.book?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {loan.book?.author}
                      </p>
                      <div className="mt-auto flex items-center gap-2 pt-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Badge
                          className={
                            isOverdue
                              ? "bg-danger text-danger-foreground"
                              : daysLeft <= 3
                                ? "bg-warning text-warning-foreground"
                                : "bg-success text-success-foreground"
                          }
                        >
                          {isOverdue
                            ? `${Math.abs(daysLeft)} days overdue`
                            : `${daysLeft} days left`}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <Card
            className="border-gold/40 bg-gold/5 p-6"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-foreground" />
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Recommended for you
              </h2>
              {topCategories.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Based on: {topCategories.join(", ")}
                </Badge>
              )}
            </div>
            {recommendations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Borrow more books to get personalised recommendations
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {recommendations.map((book) => (
                  <Card key={book.id} className="flex gap-3 p-3">
                    <BookCover
                      title={book.title}
                      author={book.author}
                      cover={getBookGradient(book.title)}
                      className="w-24 shrink-0"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 className="line-clamp-2 font-serif text-sm font-semibold text-foreground">
                        {book.title}
                      </h3>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {book.author}
                      </p>
                      <Badge className="mt-auto w-fit bg-success text-success-foreground text-xs">
                        Available
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Ask librarian to issue
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Borrowing history
            </h2>
          </div>
          {returnedLoans.length === 0 ? (
            <Card className="grid place-items-center gap-2 p-12 text-center">
              <History className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No borrowing history yet.</p>
            </Card>
          ) : (
            <Card
              className="overflow-hidden"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Book</th>
                      <th className="px-4 py-3 font-medium">Borrowed</th>
                      <th className="px-4 py-3 font-medium">Returned</th>
                      <th className="px-4 py-3 font-medium">Fine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {returnedLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {loan.book?.title}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(loan.borrowed_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {loan.returned_at
                            ? new Date(loan.returned_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {loan.fine_amount > 0 ? (
                            <span className="text-danger">
                              ₦{loan.fine_amount}
                            </span>
                          ) : (
                            <Badge className="bg-success text-success-foreground">
                              On time
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
