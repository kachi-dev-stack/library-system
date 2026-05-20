"use client";
import { useState } from "react";
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
};

export default function BooksClient({
  books: initial,
  backUrl = "/admin",
}: {
  books: Book[];
  backUrl?: string;
}) {
  const [books, setBooks] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    description: "",
    total_copies: 1,
    published_year: new Date().getFullYear(),
  });

  const supabase = createClient();

  const filtered = books.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      isbn: "",
      category: "",
      description: "",
      total_copies: 1,
      published_year: new Date().getFullYear(),
    });
    setEditBook(null);
    setError("");
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (book: Book) => {
    setEditBook(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      description: book.description,
      total_copies: book.total_copies,
      published_year: book.published_year,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    if (!form.title || !form.author || !form.category) {
      setError("Title, author and category are required");
      setLoading(false);
      return;
    }

    if (editBook) {
      // If total_copies increased, increase available_copies by the difference
      const diff = form.total_copies - editBook.total_copies;
      const new_available = Math.max(0, editBook.available_copies + diff);

      const { data, error: err } = await supabase
        .from("books")
        .update({ ...form, available_copies: new_available })
        .eq("id", editBook.id)
        .select()
        .single();

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setBooks(books.map((b) => (b.id === editBook.id ? data : b)));
    } else {
      // New book: available_copies starts equal to total_copies
      const { data, error: err } = await supabase
        .from("books")
        .insert({ ...form, available_copies: form.total_copies })
        .select()
        .single();

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setBooks([data, ...books]);
    }

    setShowForm(false);
    resetForm();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    await supabase.from("books").delete().eq("id", id);
    setBooks(books.filter((b) => b.id !== id));
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
          <span className="font-bold text-gray-900">Manage Books</span>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add Book
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <input
          type="text"
          placeholder="Search by title, author or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-medium">No books found</p>
            <p className="text-sm mt-1">Add your first book to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Author
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Total Copies
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Available
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {book.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{book.author}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {book.total_copies}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${book.available_copies > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                      >
                        {book.available_copies > 0
                          ? `${book.available_copies} available`
                          : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => openEdit(book)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editBook ? "Edit Book" : "Add New Book"}
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Author *
                  </label>
                  <input
                    value={form.author}
                    onChange={(e) =>
                      setForm({ ...form, author: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ISBN
                  </label>
                  <input
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="e.g. Science, Fiction"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Total Copies
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.total_copies}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        total_copies: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Published Year
                  </label>
                  <input
                    type="number"
                    value={form.published_year}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        published_year: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : editBook ? "Update Book" : "Add Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
