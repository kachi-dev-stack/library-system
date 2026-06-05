"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  RotateCcw,
  CalendarClock,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

type Member = {
  id: string;
  full_name: string;
  email: string;
};

interface LoansClientProps {
  books: Book[];
  members: Member[];
  loans: Loan[];
}

const statusBadge = (status: string) => {
  if (status === "active")
    return <Badge className="bg-success text-success-foreground">Active</Badge>;
  if (status === "overdue")
    return <Badge className="bg-danger text-danger-foreground">Overdue</Badge>;
  return <Badge variant="secondary">Returned</Badge>;
};

function LoanTable({
  rows,
  onReturn,
}: {
  rows: Loan[];
  onReturn: (loan: Loan) => void;
}) {
  if (rows.length === 0) {
    return (
      <Card className="grid place-items-center gap-2 p-10 text-center text-muted-foreground">
        <CalendarClock className="h-7 w-7" />
        No loans in this group.
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Book</th>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Fine</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((loan) => (
              <tr key={loan.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">
                  {loan.book?.title}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {loan.member?.full_name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(loan.borrowed_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(loan.due_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 font-medium">
                  {loan.fine_amount > 0 ? (
                    <span className="text-danger">₦{loan.fine_amount}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">{statusBadge(loan.status)}</td>
                <td className="px-4 py-3 text-right">
                  {loan.status !== "returned" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReturn(loan)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Return
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function LoansClient({
  books,
  members,
  loans: initial,
}: LoansClientProps) {
  const [loans, setLoans] = useState(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [days, setDays] = useState("14");
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const grouped = useMemo(
    () => ({
      active: loans.filter((l) => l.status === "active"),
      overdue: loans.filter((l) => l.status === "overdue"),
      returned: loans.filter((l) => l.status === "returned"),
    }),
    [loans],
  );

  const dueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (Number(days) || 0));
    return d.toISOString().slice(0, 10);
  }, [days]);

  const handleIssue = async () => {
    if (!selectedMember || !selectedBook) {
      toast.error("Please select a member and a book");
      return;
    }

    const book = books.find((b) => b.id === selectedBook);
    if (!book || book.available_copies < 1) {
      toast.error("This book is not available");
      return;
    }

    setLoading(true);

    const due_date = new Date();
    due_date.setDate(due_date.getDate() + parseInt(days));

    const { data: loan, error: loanErr } = await supabase
      .from("borrow_records")
      .insert({
        member_id: selectedMember,
        book_id: selectedBook,
        due_date: due_date.toISOString(),
        status: "active",
      })
      .select(
        `
        id, status, borrowed_at, due_date, returned_at, fine_amount,
        member:profiles!borrow_records_member_id_fkey(full_name, email),
        book:books!borrow_records_book_id_fkey(title, author)
      `,
      )
      .single();

    if (loanErr) {
      toast.error(loanErr.message);
      setLoading(false);
      return;
    }

    await supabase
      .from("books")
      .update({ available_copies: book.available_copies - 1 })
      .eq("id", selectedBook);

    // Mark reservation as fulfilled if member had one
    await supabase
      .from("reservations")
      .update({ status: "fulfilled" })
      .eq("member_id", selectedMember)
      .eq("book_id", selectedBook)
      .eq("status", "pending");

    setLoans([loan as unknown as Loan, ...loans]);
    toast.success("Book issued successfully");
    setFormOpen(false);
    setSelectedMember("");
    setSelectedBook("");
    setDays("14");
    setLoading(false);
  };

  const handleReturn = async (loan: Loan) => {
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
        .select("available_copies, title")
        .eq("id", bookData.book_id)
        .single();

      if (book) {
        await supabase
          .from("books")
          .update({ available_copies: book.available_copies + 1 })
          .eq("id", bookData.book_id);

        // Check if anyone reserved this book
        const { data: reservation } = await supabase
          .from("reservations")
          .select(
            "id, member_id, member:profiles!reservations_member_id_fkey(full_name)",
          )
          .eq("book_id", bookData.book_id)
          .eq("status", "pending")
          .limit(1)
          .single();

        if (reservation) {
          await supabase.from("notifications").insert({
            user_id: reservation.member_id,
            title: "Your reserved book is available",
            message: `"${book.title}" is now available. Visit the library to collect it.`,
          });

          const { data: staff } = await supabase
            .from("profiles")
            .select("id")
            .in("role", ["admin", "librarian"]);

          if (staff) {
            await Promise.all(
              staff.map((s) =>
                supabase.from("notifications").insert({
                  user_id: s.id,
                  title: "Reserved Book Available",
                  message: `"${book.title}" is now available. ${(reservation.member as any)?.full_name} is waiting for it.`,
                }),
              ),
            );
          }
        }
      }
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
    toast.success(`"${loan.book?.title}" returned successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Issue a book
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({grouped.active.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({grouped.overdue.length})
          </TabsTrigger>
          <TabsTrigger value="returned">
            Returned ({grouped.returned.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <LoanTable rows={grouped.active} onReturn={handleReturn} />
        </TabsContent>
        <TabsContent value="overdue" className="mt-4">
          <LoanTable rows={grouped.overdue} onReturn={handleReturn} />
        </TabsContent>
        <TabsContent value="returned" className="mt-4">
          <LoanTable rows={grouped.returned} onReturn={handleReturn} />
        </TabsContent>
      </Tabs>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Issue a book</DialogTitle>
            <DialogDescription>
              Select a member and a book, then set the loan duration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Member *</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Book *</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {books
                    .filter((b) => b.available_copies > 0)
                    .map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.title} ({b.available_copies} left)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="days">Loan duration (days)</Label>
              <Input
                id="days"
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Due date:{" "}
                <span className="font-medium text-foreground">{dueDate}</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleIssue} disabled={loading}>
              {loading ? "Issuing..." : "Issue book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
