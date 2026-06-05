"use client";

import { useMemo } from "react";
import {
  BarChart3,
  AlertTriangle,
  ShieldAlert,
  History,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ReportsClientProps {
  loans: Loan[];
  topBooks: TopBook[];
  overdueLoans: OverdueLoan[];
  activeLoans: ActiveLoan[];
}

export default function ReportsClient({
  loans,
  topBooks,
  overdueLoans,
  activeLoans,
}: ReportsClientProps) {
  // Calculate summary stats
  const totalLoans = loans.length;
  const activeCount = loans.filter((l) => l.status === "active").length;
  const totalFines = loans.reduce((sum, l) => sum + (l.fine_amount || 0), 0);

  // Calculate most borrowed books
  const mostBorrowed = useMemo(() => {
    const bookCount: Record<
      string,
      { title: string; author: string; count: number }
    > = {};
    topBooks.forEach((record) => {
      const id = record.book_id;
      if (!bookCount[id]) {
        bookCount[id] = {
          title: record.book?.title || "Unknown",
          author: record.book?.author || "Unknown",
          count: 0,
        };
      }
      bookCount[id].count++;
    });
    return Object.values(bookCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [topBooks]);

  // Calculate risk profiles
  const riskProfiles = useMemo(() => {
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

    return activeLoans
      .filter((loan) => (lateReturnMap[loan.member_id] || 0) >= 1)
      .map((loan) => {
        const lateCount = lateReturnMap[loan.member_id] || 0;
        return {
          member_id: loan.member_id,
          full_name: loan.member?.full_name || "Unknown",
          email: loan.member?.email || "",
          lateReturns: lateCount,
          totalLoans: totalLoanMap[loan.member_id] || 1,
          currentBook: loan.book?.title || "Unknown",
          dueDate: loan.due_date,
          riskLevel: (lateCount >= 2 ? "High" : "Medium") as "High" | "Medium",
        };
      })
      .sort((a, b) => b.lateReturns - a.lateReturns);
  }, [loans, activeLoans]);

  const maxBorrow = mostBorrowed[0]?.count || 1;

  return (
    <Tabs defaultValue="summary">
      <TabsList className="flex-wrap">
        <TabsTrigger value="summary">
          <BarChart3 className="h-4 w-4" /> Summary
        </TabsTrigger>
        <TabsTrigger value="overdue">
          <AlertTriangle className="h-4 w-4" /> Overdue
        </TabsTrigger>
        <TabsTrigger value="risk">
          <ShieldAlert className="h-4 w-4" /> Risk detection
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="h-4 w-4" /> History
        </TabsTrigger>
      </TabsList>

      {/* Summary Tab */}
      <TabsContent value="summary" className="mt-5 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total loans" value={totalLoans} icon={BarChart3} />
          <StatCard
            label="Active loans"
            value={activeCount}
            icon={TrendingUp}
            tone="success"
          />
          <StatCard
            label="Overdue loans"
            value={overdueLoans.length}
            icon={AlertTriangle}
            tone="danger"
          />
          <StatCard
            label="Fines collected"
            value={`₦${totalFines.toLocaleString()}`}
            icon={BarChart3}
            tone="gold"
          />
        </div>

        <Card className="p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Most borrowed books
          </h3>
          <div className="mt-4 space-y-3">
            {mostBorrowed.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No borrowing data yet
              </p>
            ) : (
              mostBorrowed.map((book) => (
                <div key={book.title} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm text-foreground sm:w-56">
                    {book.title}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-600"
                      style={{ width: `${(book.count / maxBorrow) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-muted-foreground">
                    {book.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </TabsContent>

      {/* Overdue Tab */}
      <TabsContent value="overdue" className="mt-5">
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
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {overdueLoans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No overdue loans
                    </td>
                  </tr>
                ) : (
                  overdueLoans.map((loan) => {
                    const daysLate = Math.floor(
                      (new Date().getTime() -
                        new Date(loan.due_date).getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    return (
                      <tr key={loan.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {loan.book?.title}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {loan.member?.full_name}
                        </td>
                        <td className="px-4 py-3 text-danger">
                          {new Date(loan.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-danger">
                          ₦{(daysLate * 50).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>

      {/* Risk Detection Tab */}
      <TabsContent value="risk" className="mt-5 space-y-4">
        <Card className="flex items-start gap-3 border-gold/40 bg-gold/10 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 text-gold-foreground" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">AI risk detection.</span> Members
            with an active loan and a history of late returns are flagged here —{" "}
            <strong>medium</strong> for one late return,
            <strong> high</strong> for two or more.
          </p>
        </Card>

        {riskProfiles.length === 0 ? (
          <Card className="grid place-items-center gap-2 p-12 text-center">
            <ShieldAlert className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No at-risk members detected</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {riskProfiles.map((member) => (
              <Card
                key={member.member_id}
                className="flex items-center justify-between gap-3 p-5"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div>
                  <p className="font-medium text-foreground">
                    {member.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Currently borrowing “{member.currentBook}”
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {member.lateReturns} late return(s) on record
                  </p>
                </div>
                <Badge
                  className={
                    member.riskLevel === "High"
                      ? "bg-danger text-danger-foreground"
                      : "bg-warning text-warning-foreground"
                  }
                >
                  {member.riskLevel === "High" ? "High risk" : "Medium risk"}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* History Tab */}
      <TabsContent value="history" className="mt-5">
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
                  <th className="px-4 py-3 font-medium">Returned</th>
                  <th className="px-4 py-3 font-medium">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No loan history yet
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => (
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
                        {loan.returned_at
                          ? new Date(loan.returned_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {loan.fine_amount > 0 ? (
                          <span className="text-danger">
                            ₦{loan.fine_amount.toLocaleString()}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
