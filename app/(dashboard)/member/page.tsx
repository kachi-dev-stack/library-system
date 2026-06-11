import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NotificationBell } from "@/components/NotificationBell";
import { memberNav } from "@/lib/nav-config";
import MemberDashboardClient from "./MemberDashboardClient";

export default async function MemberPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "member") redirect("/login");

  if (profile?.status === "suspended") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border p-8 text-center max-w-md shadow">
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
        </div>
      </div>
    );
  }

  const [{ data: loans }, { data: allBooks }] = await Promise.all([
    supabase
      .from("borrow_records")
      .select(
        "id, status, borrowed_at, due_date, returned_at, fine_amount, book:books!borrow_records_book_id_fkey(id, title, author, category)",
      )
      .eq("member_id", user.id)
      .order("borrowed_at", { ascending: false }),
    supabase
      .from("books")
      .select("id, title, author, category, available_copies")
      .gt("available_copies", 0),
  ]);

  // Content-based recommendation
  const categoryCount: Record<string, number> = {};
  const borrowedBookIds = new Set<string>();

  loans?.forEach((loan) => {
    const book = loan.book as any;
    if (book?.category)
      categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
    if (book?.id) borrowedBookIds.add(book.id);
  });

  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  let recommendations = (allBooks ?? [])
    .filter(
      (b) => !borrowedBookIds.has(b.id) && topCategories.includes(b.category),
    )
    .slice(0, 5);

  if (recommendations.length === 0) {
    recommendations = (allBooks ?? [])
      .filter((b) => !borrowedBookIds.has(b.id))
      .slice(0, 5);
  }

  return (
    <DashboardLayout
      nav={memberNav}
      roleLabel="Member"
      userName={profile.full_name}
      title="My Library"
      subtitle="Your borrowed books and recommendations"
      headerExtra={<NotificationBell />}
    >
      <MemberDashboardClient
        loans={(loans ?? []) as any}
        recommendations={recommendations}
        topCategories={topCategories}
      />
    </DashboardLayout>
  );
}
