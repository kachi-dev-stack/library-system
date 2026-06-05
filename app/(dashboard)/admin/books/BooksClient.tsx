"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { BookCover } from "@/components/BookCover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface BooksClientProps {
  books: Book[];
  basePath: string;
}

// Array of beautiful gradient classes for book covers
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

// Get a deterministic gradient based on book title
function getBookGradient(title: string): string {
  const index = title.length % coverGradients.length;
  return coverGradients[index];
}

export default function BooksClient({ books: initialBooks }: BooksClientProps) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
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

  // Get unique categories from books
  const categories = useMemo(() => {
    const cats = new Set(books.map((b) => b.category));
    return ["All", ...Array.from(cats).sort()];
  }, [books]);

  // Filter books based on search and category
  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchesQuery =
        !query ||
        [b.title, b.author, b.isbn].some((f) =>
          f?.toLowerCase().includes(query.toLowerCase()),
        );
      const matchesCat = cat === "All" || b.category === cat;
      return matchesQuery && matchesCat;
    });
  }, [books, query, cat]);

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
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditing(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || "",
      category: book.category,
      description: book.description || "",
      total_copies: book.total_copies,
      published_year: book.published_year,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.author || !form.category) {
      toast.error("Title, author and category are required");
      return;
    }

    setLoading(true);

    if (editing) {
      // Update existing book
      const diff = form.total_copies - editing.total_copies;
      const new_available = Math.max(0, editing.available_copies + diff);

      const { data, error } = await supabase
        .from("books")
        .update({ ...form, available_copies: new_available })
        .eq("id", editing.id)
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      setBooks(books.map((b) => (b.id === editing.id ? data : b)));
      toast.success("Book updated successfully");
    } else {
      // Add new book
      const { data, error } = await supabase
        .from("books")
        .insert({ ...form, available_copies: form.total_copies })
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      setBooks([data, ...books]);
      toast.success("Book added successfully");
    }

    setFormOpen(false);
    resetForm();
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleting) return;

    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", deleting.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setBooks(books.filter((b) => b.id !== deleting.id));
    toast.success("Book deleted successfully");
    setDeleting(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author or ISBN…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors ${
                cat === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="h-4 w-4" /> Add book
        </Button>
      </div>

      {/* Books Grid */}
      {filtered.length === 0 ? (
        <Card className="grid place-items-center gap-2 p-12 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No books match your search.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b) => (
            <Card
              key={b.id}
              className="flex gap-4 p-4"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <BookCover
                title={b.title}
                author={b.author}
                cover={getBookGradient(b.title)}
                className="w-20 shrink-0"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-base font-semibold text-foreground">
                      {b.title}
                    </h3>
                    <p className="truncate text-sm text-muted-foreground">
                      {b.author}
                    </p>
                  </div>
                  <Badge variant="secondary">{b.category}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {b.description || "No description available"}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span
                    className={`text-xs font-medium ${
                      b.available_copies === 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    {b.available_copies}/{b.total_copies} available
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(b)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleting(b)}
                      aria-label="Delete"
                      className="text-danger hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Book Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Edit book" : "Add a new book"}
            </DialogTitle>
            <DialogDescription>
              Fill in the book details below. Available copies update
              automatically as books are issued.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="The Silent Library"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Ada Okafor"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  placeholder="978-0-14-1000"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Fiction"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="A brief description of the book..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="total">Total copies *</Label>
                <Input
                  id="total"
                  type="number"
                  min={0}
                  value={form.total_copies}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      total_copies: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Published year</Label>
                <Input
                  id="year"
                  type="number"
                  value={form.published_year}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      published_year:
                        parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : editing ? "Save changes" : "Add book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the book from the catalogue. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
