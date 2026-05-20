"use client";

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

type Profile = {
  full_name: string;
  email: string;
  status: string;
};

export default function MemberClient({
  profile,
  loans,
  recommendations,
  topCategories,
}: {
  profile: Profile;
  loans: Loan[];
  recommendations: Book[];
  topCategories: string[];
}) {
  const activeLoans = loans.filter((l) => l.status === "active");
  const overdueLoans = loans.filter((l) => {
    return l.status === "active" && new Date(l.due_date) < new Date();
  });
  const returnedLoans = loans.filter((l) => l.status === "returned");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span className="font-bold text-gray-900">Library System</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Member
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/member/reservations"
            className="text-sm text-blue-600 hover:underline"
          >
            Reservations
          </a>
          <span className="text-sm text-gray-600">{profile.full_name}</span>
          <a
            href="/api/auth/signout"
            className="text-sm text-red-500 hover:underline"
          >
            Sign out
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Overdue Alert */}
        {overdueLoans.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-700">
                You have {overdueLoans.length} overdue book
                {overdueLoans.length > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                Please return them as soon as possible to avoid additional fines
                of ₦50/day.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {activeLoans.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Books Borrowed</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-green-600">
              {returnedLoans.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Books Returned</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-red-500">
              {overdueLoans.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Overdue</p>
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            My Current Books
          </h2>
          {activeLoans.length === 0 ? (
            <p className="text-gray-400 text-sm">
              You have no books currently borrowed.
            </p>
          ) : (
            <div className="space-y-3">
              {activeLoans.map((loan) => {
                const isOverdue = new Date(loan.due_date) < new Date();
                const daysLeft = Math.ceil(
                  (new Date(loan.due_date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                return (
                  <div
                    key={loan.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${isOverdue ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {loan.book?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loan.book?.author} · {loan.book?.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-600"}`}
                      >
                        {isOverdue
                          ? `${Math.abs(daysLeft)} days overdue`
                          : `${daysLeft} days left`}
                      </p>
                      <p className="text-xs text-gray-400">
                        Due {new Date(loan.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-gray-900">
              Recommended For You
            </h2>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              ✨ AI
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {topCategories.length > 0
              ? `Based on your interest in: ${topCategories.join(", ")}`
              : "Popular books available in the library"}
          </p>
          {recommendations.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No recommendations available right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendations.map((book) => (
                <div
                  key={book.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    📚
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {book.title}
                    </p>
                    <p className="text-xs text-gray-500">{book.author}</p>
                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded mt-1 inline-block">
                      {book.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Borrowing History */}
        {returnedLoans.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Borrowing History
            </h2>
            <div className="space-y-2">
              {returnedLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {loan.book?.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      Returned{" "}
                      {loan.returned_at
                        ? new Date(loan.returned_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  {loan.fine_amount > 0 && (
                    <span className="text-xs text-red-500 font-medium">
                      Fine: ₦{loan.fine_amount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
