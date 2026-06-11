"use client";

import { BookCover } from "@/components/BookCover";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Sparkles,
  History,
  Clock,
  AlertTriangle,
} from "lucide-react";

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

function getBookGradient(title: string): string {
  return coverGradients[title.length % coverGradients.length];
}

type Loan = {
  id: string;
  status: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  fine_amount: number;
  book: { id: string; title: string; author: string; category: string };
};

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  available_copies: number;
};

export default function MemberDashboardClient({
  loans,
  recommendations,
  topCategories,
}: {
  loans: Loan[];
  recommendations: Book[];
  topCategories: string[];
}) {
  const activeLoans = loans.filter((l) => l.status === "active");
  const overdueLoans = loans.filter(
    (l) => l.status === "active" && new Date(l.due_date) < new Date(),
  );
  const returnedLoans = loans.filter((l) => l.status === "returned");

  return (
    <div className="space-y-8">
      {overdueLoans.length > 0 && (
        <Card className="border-danger/40 bg-danger/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-danger" />
            <div>
              <p className="text-sm font-semibold text-danger">
                {overdueLoans.length} overdue book
                {overdueLoans.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-danger/80 mt-0.5">
                Please return them as soon as possible. Fine: ₦50/day.
              </p>
            </div>
          </div>
        </Card>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Currently borrowed
          </h2>
        </div>
        {activeLoans.length === 0 ? (
          <Card className="grid place-items-center gap-2 p-12 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              No books currently borrowed.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeLoans.map((loan) => {
              const isOverdue = new Date(loan.due_date) < new Date();
              const daysLeft = Math.ceil(
                (new Date(loan.due_date).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return (
                <Card
                  key={loan.id}
                  className="flex gap-4 p-4"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <BookCover
                    title={loan.book?.title || "Unknown"}
                    author={loan.book?.author}
                    cover={getBookGradient(loan.book?.title || "Unknown")}
                    className="w-20 shrink-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="font-serif text-base font-semibold text-foreground">
                      {loan.book?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {loan.book?.author}
                    </p>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Badge
                        className={
                          isOverdue
                            ? "bg-danger text-danger-foreground"
                            : daysLeft <= 3
                              ? "bg-warning text-warning-foreground"
                              : "bg-success text-success-foreground"
                        }
                      >
                        {isOverdue
                          ? `${Math.abs(daysLeft)} days overdue`
                          : `${daysLeft} days left`}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <Card
          className="border-gold/40 bg-gold/5 p-6"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold-foreground" />
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Recommended for you
            </h2>
            {topCategories.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                Based on: {topCategories.join(", ")}
              </Badge>
            )}
          </div>
          {recommendations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Borrow more books to get personalised recommendations
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {recommendations.map((book) => (
                <Card key={book.id} className="flex gap-3 p-3">
                  <BookCover
                    title={book.title}
                    author={book.author}
                    cover={getBookGradient(book.title)}
                    className="w-24 shrink-0"
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="line-clamp-2 font-serif text-sm font-semibold text-foreground">
                      {book.title}
                    </h3>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {book.author}
                    </p>
                    <Badge className="mt-auto w-fit bg-success text-success-foreground text-xs">
                      Available
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Ask librarian to issue
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Borrowing history
          </h2>
        </div>
        {returnedLoans.length === 0 ? (
          <Card className="grid place-items-center gap-2 p-12 text-center">
            <History className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No borrowing history yet.</p>
          </Card>
        ) : (
          <Card
            className="overflow-hidden"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Book</th>
                    <th className="px-4 py-3 font-medium">Borrowed</th>
                    <th className="px-4 py-3 font-medium">Returned</th>
                    <th className="px-4 py-3 font-medium">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {returnedLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {loan.book?.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(loan.borrowed_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {loan.returned_at
                          ? new Date(loan.returned_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {loan.fine_amount > 0 ? (
                          <span className="text-danger">
                            ₦{loan.fine_amount}
                          </span>
                        ) : (
                          <Badge className="bg-success text-success-foreground">
                            On time
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
