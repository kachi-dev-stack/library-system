"use client";

import { useState } from "react";

type Loan = {
  id: string;
  member_id: string;
  status: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  fine_amount: number;
  member: { full_name: string };
  book: { title: string };
};

type TopBook = {
  book_id: string;
  book: { title: string; author: string };
};

type OverdueLoan = {
  id: string;
  due_date: string;
  fine_amount: number;
  member: { full_name: string; email: string };
  book: { title: string };
};

type ActiveLoan = {
  id: string;
  member_id: string;
  due_date: string;
  returned_at: string | null;
  status: string;
  member: { full_name: string; email: string };
  book: { title: string };
};

type RiskProfile = {
  member_id: string;
  full_name: string;
  email: string;
  lateReturns: number;
  totalLoans: number;
  currentBook: string;
  dueDate: string;
  riskLevel: "High" | "Medium";
};

export default function ReportsClient({
  loans,
  topBooks,
  overdueLoans,
  activeLoans,
}: {
  loans: Loan[];
  topBooks: TopBook[];
  overdueLoans: OverdueLoan[];
  activeLoans: ActiveLoan[];
}) {
  const [tab, setTab] = useState<"summary" | "overdue" | "risk" | "history">(
    "summary",
  );

  const totalLoans = loans.length;
  const activeCount = loans.filter((l) => l.status === "active").length;
  const returnedCount = loans.filter((l) => l.status === "returned").length;
  const totalFines = loans.reduce((sum, l) => sum + (l.fine_amount || 0), 0);

  const bookCount: Record<
    string,
    { title: string; author: string; count: number }
  > = {};
  topBooks.forEach((record) => {
    const id = record.book_id;
    if (!bookCount[id])
      bookCount[id] = {
        title: record.book?.title,
        author: record.book?.author,
        count: 0,
      };
    bookCount[id].count++;
  });
  const mostBorrowed = Object.values(bookCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const lateReturnMap: Record<string, number> = {};
  const totalLoanMap: Record<string, number> = {};

  loans.forEach((loan) => {
    const memberId = loan.member_id;
    if (!memberId) return;
    totalLoanMap[memberId] = (totalLoanMap[memberId] || 0) + 1;
    if (loan.status === "returned" && loan.returned_at) {
      const returnedAt = new Date(loan.returned_at);
      const dueDate = new Date(loan.due_date);
      if (returnedAt > dueDate) {
        lateReturnMap[memberId] = (lateReturnMap[memberId] || 0) + 1;
      }
    }
  });

  const riskProfiles: RiskProfile[] = activeLoans
    .filter((loan) => (lateReturnMap[loan.member_id] || 0) >= 1)
    .map((loan) => {
      const lateCount = lateReturnMap[loan.member_id] || 0;
      return {
        member_id: loan.member_id,
        full_name: loan.member?.full_name,
        email: loan.member?.email,
        lateReturns: lateCount,
        totalLoans: totalLoanMap[loan.member_id] || 1,
        currentBook: loan.book?.title || "Unknown",
        dueDate: loan.due_date,
        riskLevel: (lateCount >= 2 ? "High" : "Medium") as "High" | "Medium",
      };
    })
    .sort((a, b) => b.lateReturns - a.lateReturns);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </a>
        <span className="font-bold text-gray-900">Reports</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["summary", "overdue", "risk", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {t === "risk" ? "⚠️ Risk Detection" : t}
            </button>
          ))}
        </div>

        {tab === "summary" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatBox label="Total Loans" value={totalLoans} color="blue" />
              <StatBox
                label="Active Loans"
                value={activeCount}
                color="yellow"
              />
              <StatBox label="Returned" value={returnedCount} color="green" />
              <StatBox label="Total Fines (₦)" value={totalFines} color="red" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Most Borrowed Books
              </h2>
              {mostBorrowed.length === 0 ? (
                <p className="text-gray-400 text-sm">No borrowing data yet</p>
              ) : (
                <div className="space-y-3">
                  {mostBorrowed.map((book, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {book.title}
                          </p>
                          <p className="text-xs text-gray-500">{book.author}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        {book.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "overdue" && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {overdueLoans.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-medium">No overdue loans</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">
                      Member
                    </th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">
                      Book
                    </th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">
                      Due Date
                    </th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">
                      Days Late
                    </th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">
                      Fine
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {overdueLoans.map((loan) => {
                    const daysLate = Math.floor(
                      (new Date().getTime() -
                        new Date(loan.due_date).getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    return (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {loan.member?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {loan.member?.email}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {loan.book?.title}
                        </td>
                        <td className="px-6 py-4 text-red-500">
                          {new Date(loan.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                            {daysLate} days
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          ₦{daysLate * 50}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "risk" && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
              <p className="text-purple-700 font-semibold text-sm mb-1">
                ✨ AI — Overdue Risk Detection
              </p>
              <p className="text-xs text-purple-600">
                Members are flagged based on their return history. High risk = 2
                or more late returns. Medium risk = 1 late return. Only members
                with active loans are shown.
              </p>
            </div>
            {riskProfiles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-medium">No at-risk members detected</p>
                <p className="text-sm mt-1">
                  All active borrowers have a clean return history
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">
                        Member
                      </th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">
                        Current Book
                      </th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">
                        Due Date
                      </th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">
                        Late Returns
                      </th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">
                        Risk Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {riskProfiles.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {p.full_name}
                          </p>
                          <p className="text-xs text-gray-500">{p.email}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {p.currentBook}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(p.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">
                            {p.lateReturns}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {" "}
                            / {p.totalLoans} loans
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${p.riskLevel === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {p.riskLevel} Risk
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Member
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Book
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Borrowed
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Due Date
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Fine
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {loan.member?.full_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {loan.book?.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(loan.borrowed_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(loan.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          loan.status === "active"
                            ? "bg-yellow-50 text-yellow-700"
                            : loan.status === "returned"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {loan.fine_amount > 0 ? `₦${loan.fine_amount}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "text-blue-700",
    green: "text-green-700",
    yellow: "text-yellow-700",
    red: "text-red-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
