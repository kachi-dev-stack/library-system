"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
type Member = { id: string; full_name: string; email: string };

export default function LoansClient({
  books,
  members,
  loans: initial,
  backUrl = "/admin",
}: {
  books: Book[];
  members: Member[];
  loans: Loan[];
  backUrl?: string;
}) {
  const [loans, setLoans] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"active" | "returned" | "overdue">("active");
  const [form, setForm] = useState({ member_id: "", book_id: "", days: 14 });

  const supabase = createClient();

  const filtered = loans.filter((l) => l.status === tab);

  const handleIssue = async () => {
    setLoading(true);
    setError("");
    if (!form.member_id || !form.book_id) {
      setError("Please select a member and a book");
      setLoading(false);
      return;
    }

    const book = books.find((b) => b.id === form.book_id);
    if (!book || book.available_copies < 1) {
      setError("This book is not available");
      setLoading(false);
      return;
    }

    const due_date = new Date();
    due_date.setDate(due_date.getDate() + form.days);

    const { data: loan, error: loanErr } = await supabase
      .from("borrow_records")
      .insert({
        member_id: form.member_id,
        book_id: form.book_id,
        due_date: due_date.toISOString(),
        status: "active",
      })
      .select(
        `id, status, borrowed_at, due_date, returned_at, fine_amount,
        member:profiles!borrow_records_member_id_fkey(full_name, email),
        book:books!borrow_records_book_id_fkey(title, author)`,
      )
      .single();

    if (loanErr) {
      setError(loanErr.message);
      setLoading(false);
      return;
    }

    await supabase
      .from("books")
      .update({ available_copies: book.available_copies - 1 })
      .eq("id", form.book_id);

    setLoans([loan as unknown as Loan, ...loans]);
    setShowForm(false);
    setForm({ member_id: "", book_id: "", days: 14 });
    setLoading(false);
  };

  const handleReturn = async (loan: Loan) => {
    if (!confirm("Mark this book as returned?")) return;

    const returnedAt = new Date();
    const dueDate = new Date(loan.due_date);
    const daysLate = Math.max(
      0,
      Math.floor(
        (returnedAt.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const fine = daysLate * 50;

    await supabase
      .from("borrow_records")
      .update({
        status: "returned",
        returned_at: returnedAt.toISOString(),
        fine_amount: fine,
      })
      .eq("id", loan.id);

    const { data: bookData } = await supabase
      .from("borrow_records")
      .select("book_id")
      .eq("id", loan.id)
      .single();
    if (bookData) {
      const { data: book } = await supabase
        .from("books")
        .select("available_copies")
        .eq("id", bookData.book_id)
        .single();
      if (book)
        await supabase
          .from("books")
          .update({ available_copies: book.available_copies + 1 })
          .eq("id", bookData.book_id);
    }

    setLoans(
      loans.map((l) =>
        l.id === loan.id
          ? {
              ...l,
              status: "returned",
              returned_at: returnedAt.toISOString(),
              fine_amount: fine,
            }
          : l,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href={backUrl} className="text-gray-400 hover:text-gray-600">
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
          <span className="font-bold text-gray-900">Issue / Return Books</span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Issue Book
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6">
          {(["active", "overdue", "returned"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {t} ({loans.filter((l) => l.status === t).length})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📖</p>
            <p className="font-medium">No {tab} loans</p>
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
                    Book
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Borrowed
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Due Date
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Fine
                  </th>
                  {tab === "active" && (
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {loan.member?.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loan.member?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {loan.book?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loan.book?.author}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(loan.borrowed_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${new Date(loan.due_date) < new Date() && loan.status === "active" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"}`}
                      >
                        {new Date(loan.due_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {loan.fine_amount > 0 ? `₦${loan.fine_amount}` : "—"}
                    </td>
                    {tab === "active" && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleReturn(loan)}
                          className="text-green-600 hover:underline text-xs font-medium"
                        >
                          Mark Returned
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Issue Book to Member
            </h2>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Member *
                </label>
                <select
                  value={form.member_id}
                  onChange={(e) =>
                    setForm({ ...form, member_id: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Book *
                </label>
                <select
                  value={form.book_id}
                  onChange={(e) =>
                    setForm({ ...form, book_id: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose book --</option>
                  {books
                    .filter((b) => b.available_copies > 0)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} — {b.author} ({b.available_copies} left)
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Loan Duration (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={form.days}
                  onChange={(e) =>
                    setForm({ ...form, days: parseInt(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleIssue}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Issuing..." : "Issue Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
