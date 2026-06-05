"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { librarianNav } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, RotateCcw, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Profile = {
  role: string;
  full_name: string;
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

export default function LibrarianLoansPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [days, setDays] = useState("14");
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (profileData?.role !== "librarian") {
        router.push("/login");
        return;
      }

      const { data: booksData } = await supabase
        .from("books")
        .select("id, title, author, available_copies")
        .order("title");

      const { data: membersData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "member")
        .eq("status", "active");

      const { data: loansData } = await supabase
        .from("borrow_records")
        .select(
          `
          id, status, borrowed_at, due_date, returned_at, fine_amount,
          member:profiles!borrow_records_member_id_fkey(full_name, email),
          book:books!borrow_records_book_id_fkey(title, author)
        `,
        )
        .order("borrowed_at", { ascending: false });

      setProfile(profileData);
      setBooks(booksData ?? []);
      setMembers(membersData ?? []);

      // Fix: Use a type assertion with 'any' first, then cast to Loan[]
      const typedLoans: Loan[] = (loansData as any) || [];
      setLoans(typedLoans);

      setLoading(false);
    };

    fetchData();
  }, [router]);

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

    setIssuing(true);
    const supabase = createClient();

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
      setIssuing(false);
      return;
    }

    await supabase
      .from("books")
      .update({ available_copies: book.available_copies - 1 })
      .eq("id", selectedBook);

    setLoans([loan as unknown as Loan, ...loans]);
    toast.success("Book issued successfully");
    setFormOpen(false);
    setSelectedMember("");
    setSelectedBook("");
    setDays("14");
    setIssuing(false);
  };

  const handleReturn = async (loan: Loan) => {
    const supabase = createClient();
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

      if (book) {
        await supabase
          .from("books")
          .update({ available_copies: book.available_copies + 1 })
          .eq("id", bookData.book_id);
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

  const activeLoans = loans.filter((l) => l.status === "active");
  const overdueLoans = loans.filter((l) => l.status === "overdue");
  const returnedLoans = loans.filter((l) => l.status === "returned");

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (parseInt(days) || 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      nav={librarianNav}
      roleLabel="Librarian"
      userName={profile?.full_name || "Librarian"}
      title="Loans"
      subtitle="Issue and return books"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Issue a book
          </Button>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeLoans.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overdueLoans.length})
            </TabsTrigger>
            <TabsTrigger value="returned">
              Returned ({returnedLoans.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <LoanTable rows={activeLoans} onReturn={handleReturn} />
          </TabsContent>
          <TabsContent value="overdue" className="mt-4">
            <LoanTable rows={overdueLoans} onReturn={handleReturn} />
          </TabsContent>
          <TabsContent value="returned" className="mt-4">
            <LoanTable rows={returnedLoans} onReturn={handleReturn} />
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
                <Select
                  value={selectedMember}
                  onValueChange={setSelectedMember}
                >
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
                  <span className="font-medium text-foreground">
                    {dueDate.toLocaleDateString()}
                  </span>
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
              <Button onClick={handleIssue} disabled={issuing}>
                {issuing ? "Issuing..." : "Issue book"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Loan Table Component
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
                <td className="px-4 py-3">
                  {loan.status === "active" && (
                    <Badge className="bg-success text-success-foreground">
                      Active
                    </Badge>
                  )}
                  {loan.status === "overdue" && (
                    <Badge className="bg-danger text-danger-foreground">
                      Overdue
                    </Badge>
                  )}
                  {loan.status === "returned" && (
                    <Badge variant="secondary">Returned</Badge>
                  )}
                </td>
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
