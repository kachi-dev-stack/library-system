import { BarChart3, AlertTriangle, ShieldAlert, History, Sparkles, TrendingUp } from "lucide-react";
import {
  loans,
  mostBorrowed,
  riskMembers,
  members,
  books,
  ngn,
} from "@/lib/library-data";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ReportsView() {
  const overdue = loans.filter((l) => l.status === "overdue");
  const totalFines = loans.reduce((s, l) => s + l.fine, 0);
  const maxBorrow = Math.max(...mostBorrowed.map((b) => b.count));

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

      <TabsContent value="summary" className="mt-5 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total books" value={books.length} icon={BarChart3} />
          <StatCard label="Active members" value={members.filter((m) => m.status === "active").length} icon={TrendingUp} tone="success" />
          <StatCard label="Overdue loans" value={overdue.length} icon={AlertTriangle} tone="danger" />
          <StatCard label="Fines collected" value={ngn(totalFines)} icon={BarChart3} tone="gold" />
        </div>
        <Card className="p-6 shadow-[var(--shadow-soft)]">
          <h3 className="font-serif text-lg font-semibold text-foreground">Most borrowed books</h3>
          <div className="mt-4 space-y-3">
            {mostBorrowed.map((b) => (
              <div key={b.title} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-sm text-foreground sm:w-56">{b.title}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[var(--gradient-gold)]"
                    style={{ width: `${(b.count / maxBorrow) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-medium text-muted-foreground">{b.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="overdue" className="mt-5">
        <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
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
                {overdue.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{l.book}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.member}</td>
                    <td className="px-4 py-3 text-danger">{l.due}</td>
                    <td className="px-4 py-3 font-medium text-danger">{ngn(l.fine)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="risk" className="mt-5 space-y-4">
        <Card className="flex items-start gap-3 border-gold/40 bg-gold/10 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 text-gold-foreground" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">AI risk detection.</span> Members with an active loan and a
            history of late returns are flagged here — <strong>medium</strong> for one late return,
            <strong> high</strong> for two or more.
          </p>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          {riskMembers.map((m) => (
            <Card key={m.name} className="flex items-center justify-between gap-3 p-5 shadow-[var(--shadow-soft)]">
              <div>
                <p className="font-medium text-foreground">{m.name}</p>
                <p className="text-sm text-muted-foreground">Currently borrowing “{m.activeLoan}”</p>
                <p className="mt-1 text-xs text-muted-foreground">{m.lateReturns} late return(s) on record</p>
              </div>
              <Badge
                className={
                  m.level === "high"
                    ? "bg-danger text-danger-foreground"
                    : "bg-warning text-warning-foreground"
                }
              >
                {m.level === "high" ? "High risk" : "Medium risk"}
              </Badge>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="history" className="mt-5">
        <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
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
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{l.book}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.member}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.issued}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.returned ?? "—"}</td>
                    <td className="px-4 py-3 font-medium">{l.fine > 0 ? ngn(l.fine) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}