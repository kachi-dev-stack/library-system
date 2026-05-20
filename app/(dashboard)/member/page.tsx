import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MemberClient from "./MemberClient";

export default async function MemberDashboard() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-md">
          <p className="text-4xl mb-4">🚫</p>
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Account Suspended
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Your library account has been suspended. Please contact the
            librarian for assistance.
          </p>
          <a
            href="/api/auth/signout"
            className="text-sm text-red-500 hover:underline"
          >
            Sign out
          </a>
        </div>
      </div>
    );
  }

  // Get member's borrow history
  const { data: myLoans } = await supabase
    .from("borrow_records")
    .select(
      "id, status, borrowed_at, due_date, returned_at, fine_amount, book:books!borrow_records_book_id_fkey(id, title, author, category)",
    )
    .eq("member_id", user.id)
    .order("borrowed_at", { ascending: false });

  // Get all books for recommendations
  const { data: allBooks } = await supabase
    .from("books")
    .select("id, title, author, category, available_copies")
    .gt("available_copies", 0);

  // --- INTELLIGENCE: Content-based recommendation ---
  // Find categories the member reads most
  const categoryCount: Record<string, number> = {};
  const borrowedBookIds = new Set<string>();

  myLoans?.forEach((loan) => {
    const book = loan.book as any;
    if (book?.category) {
      categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
    }
    if (book?.id) borrowedBookIds.add(book.id);
  });

  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  // Recommend books in top categories that member hasn't borrowed yet
  const recommendations = (allBooks ?? [])
    .filter(
      (b) => !borrowedBookIds.has(b.id) && topCategories.includes(b.category),
    )
    .slice(0, 5);

  // Fallback: if no history, show any available books
  const fallbackBooks =
    recommendations.length === 0
      ? (allBooks ?? []).filter((b) => !borrowedBookIds.has(b.id)).slice(0, 5)
      : recommendations;

  return (
    <MemberClient
      profile={profile}
      loans={(myLoans ?? []) as any}
      recommendations={fallbackBooks}
      topCategories={topCategories}
    />
  );
}
