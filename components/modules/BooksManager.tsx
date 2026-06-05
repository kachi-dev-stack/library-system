import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { books as seedBooks, categories, type Book } from "@/lib/library-data";
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

export function BooksManager() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);

  const filtered = useMemo(() => {
    return seedBooks.filter((b) => {
      const matchesQuery =
        !query ||
        [b.title, b.author, b.isbn].some((f) =>
          f.toLowerCase().includes(query.toLowerCase()),
        );
      const matchesCat = cat === "All" || b.category === cat;
      return matchesQuery && matchesCat;
    });
  }, [query, cat]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (b: Book) => {
    setEditing(b);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
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
              className={
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors " +
                (cat === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground")
              }
            >
              {c}
            </button>
          ))}
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="h-4 w-4" /> Add book
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="grid place-items-center gap-2 p-12 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No books match your search.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b) => (
            <Card key={b.id} className="flex gap-4 p-4 shadow-[var(--shadow-soft)]">
              <BookCover title={b.title} author={b.author} cover={b.cover} className="w-24 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-base font-semibold text-foreground">
                      {b.title}
                    </h3>
                    <p className="truncate text-sm text-muted-foreground">{b.author}</p>
                  </div>
                  <Badge variant="secondary">{b.category}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{b.description}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span
                    className={
                      "text-xs font-medium " +
                      (b.availableCopies === 0 ? "text-danger" : "text-success")
                    }
                  >
                    {b.availableCopies}/{b.totalCopies} available
                  </span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(b)} aria-label="Edit">
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing ? "Edit book" : "Add a new book"}</DialogTitle>
            <DialogDescription>
              Fill in the book details below. Available copies update automatically as books are issued.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setFormOpen(false);
              toast.success(editing ? "Book updated" : "Book added");
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" defaultValue={editing?.title} placeholder="The Silent Library" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" defaultValue={editing?.author} placeholder="Ada Okafor" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input id="isbn" defaultValue={editing?.isbn} placeholder="978-0-14-1000" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" defaultValue={editing?.category} placeholder="Fiction" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" defaultValue={editing?.description} rows={3} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="total">Total copies</Label>
                <Input id="total" type="number" min={0} defaultValue={editing?.totalCopies ?? 1} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="available">Available copies</Label>
                <Input id="available" type="number" min={0} defaultValue={editing?.availableCopies ?? 1} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save changes" : "Add book"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the book from the catalogue. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success("Book deleted");
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}