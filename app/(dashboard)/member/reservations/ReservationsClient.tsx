"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  available_copies: number;
};

type Reservation = {
  id: string;
  status: string;
  reserved_at: string;
  book: { id: string; title: string; author: string; available_copies: number };
};

export default function ReservationsClient({
  userId,
  books,
  myReservations: initial,
}: {
  userId: string;
  books: Book[];
  myReservations: Reservation[];
}) {
  const [reservations, setReservations] = useState(initial);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const reservedBookIds = new Set(
    reservations.filter((r) => r.status === "pending").map((r) => r.book?.id),
  );

  const filtered = books.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleReserve = async (book: Book) => {
    setLoading(book.id);
    setMessage("");

    const { data, error } = await supabase
      .from("reservations")
      .insert({ member_id: userId, book_id: book.id, status: "pending" })
      .select(
        "id, status, reserved_at, book:books!reservations_book_id_fkey(id, title, author, available_copies)",
      )
      .single();

    if (error) {
      setMessage("Failed to reserve: " + error.message);
    } else {
      setReservations([data as any, ...reservations]);
      setMessage(`"${book.title}" has been reserved successfully.`);
    }
    setLoading(null);
  };

  const handleCancel = async (reservationId: string) => {
    await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", reservationId);
    setReservations(
      reservations.map((r) =>
        r.id === reservationId ? { ...r, status: "cancelled" } : r,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/member" className="text-gray-400 hover:text-gray-600">
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
          <span className="font-bold text-gray-900">Book Reservations</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-xl">
            {message}
          </div>
        )}

        {/* My Reservations */}
        {reservations.filter((r) => r.status === "pending").length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              My Active Reservations
            </h2>
            <div className="space-y-3">
              {reservations
                .filter((r) => r.status === "pending")
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-blue-100 bg-blue-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {r.book?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {r.book?.author} · Reserved{" "}
                        {new Date(r.reserved_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.book?.available_copies > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Now Available!
                        </span>
                      )}
                      <button
                        onClick={() => handleCancel(r.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Browse Books */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Browse & Reserve Books
          </h2>
          <input
            type="text"
            placeholder="Search by title, author or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="space-y-2">
            {filtered.map((book) => {
              const isReserved = reservedBookIds.has(book.id);
              return (
                <div
                  key={book.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      📚
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {book.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {book.author} · {book.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${book.available_copies > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                    >
                      {book.available_copies > 0
                        ? `${book.available_copies} available`
                        : "Unavailable"}
                    </span>
                    {book.available_copies === 0 && !isReserved && (
                      <button
                        onClick={() => handleReserve(book)}
                        disabled={loading === book.id}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        {loading === book.id ? "Reserving..." : "Reserve"}
                      </button>
                    )}
                    {isReserved && (
                      <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full font-medium">
                        Reserved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
