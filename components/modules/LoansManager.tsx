import { useMemo, useState } from "react";
import { Plus, RotateCcw, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { loans as seedLoans, books, members, ngn, type Loan } from "@/lib/library-data";
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

const statusBadge = (s: Loan["status"]) => {
  if (s === "active") return <Badge className="bg-success text-success-foreground">Active</Badge>;
  if (s === "overdue") return <Badge className="bg-danger text-danger-foreground">Overdue</Badge>;
  return <Badge variant="secondary">Returned</Badge>;
};

function LoanTable({ rows }: { rows: Loan[] }) {
  if (rows.length === 0)
    return (
      <Card className="grid place-items-center gap-2 p-10 text-center text-muted-foreground">
        <CalendarClock className="h-7 w-7" />
        No loans in this group.
      </Card>
    );
  return (
    <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
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
            {rows.map((l) => (
              <tr key={l.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">{l.book}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.member}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.issued}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.due}</td>
                <td className="px-4 py-3 font-medium">
                  {l.fine > 0 ? <span className="text-danger">{ngn(l.fine)}</span> : "—"}
                </td>
                <td className="px-4 py-3">{statusBadge(l.status)}</td>
                <td className="px-4 py-3 text-right">
                  {l.status !== "returned" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success(`“${l.book}” marked returned`)}
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

export function LoansManager() {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState("14");

  const grouped = useMemo(
    () => ({
      active: seedLoans.filter((l) => l.status === "active"),
      overdue: seedLoans.filter((l) => l.status === "overdue"),
      returned: seedLoans.filter((l) => l.status === "returned"),
    }),
    [],
  );

  const dueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (Number(days) || 0));
    return d.toISOString().slice(0, 10);
  }, [days]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Issue a book
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({grouped.active.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({grouped.overdue.length})</TabsTrigger>
          <TabsTrigger value="returned">Returned ({grouped.returned.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <LoanTable rows={grouped.active} />
        </TabsContent>
        <TabsContent value="overdue" className="mt-4">
          <LoanTable rows={grouped.overdue} />
        </TabsContent>
        <TabsContent value="returned" className="mt-4">
          <LoanTable rows={grouped.returned} />
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Issue a book</DialogTitle>
            <DialogDescription>Select a member and a book, then set the loan duration.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              toast.success("Book issued");
            }}
          >
            <div className="grid gap-2">
              <Label>Member</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter((m) => m.status === "active")
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Book</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {books
                    .filter((b) => b.availableCopies > 0)
                    .map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.title}
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
                Due date: <span className="font-medium text-foreground">{dueDate}</span>
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Issue book</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}