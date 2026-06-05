"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuickLink {
  label: string;
  desc: string;
  to: string;
  icon: LucideIcon;
}

interface StaffDashboardProps {
  base: "/admin" | "/librarian";
}

interface Stats {
  totalBooks: number;
  totalCopies: number;
  totalMembers: number;
  activeMembers: number;
  activeLoans: number;
  overdueLoans: number;
  totalFines: number;
}

interface RecentLoan {
  id: string;
  book_title: string;
  member_name: string;
  due_date: string;
  status: "active" | "overdue" | "returned";
}

export function StaffDashboard({ base }: StaffDashboardProps) {
  const includeMembers = base === "/admin";
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalCopies: 0,
    totalMembers: 0,
    activeMembers: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalFines: 0,
  });
  const [recentLoans, setRecentLoans] = useState<RecentLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      try {
        // Fetch books stats
        const { data: books } = await supabase
          .from("books")
          .select("id, total_copies");

        const totalBooks = books?.length || 0;
        const totalCopies =
          books?.reduce((sum, b) => sum + (b.total_copies || 0), 0) || 0;

        // Fetch members stats (only if admin)
        let totalMembers = 0;
        let activeMembers = 0;
        if (includeMembers) {
          const { data: members } = await supabase
            .from("profiles")
            .select("id, status")
            .eq("role", "member");

          totalMembers = members?.length || 0;
          activeMembers =
            members?.filter((m) => m.status === "active").length || 0;
        }

        // Fetch loans stats
        const { data: activeLoansData } = await supabase
          .from("borrow_records")
          .select("id, fine")
          .eq("status", "active");

        const { data: overdueLoansData } = await supabase
          .from("borrow_records")
          .select("id, fine")
          .eq("status", "overdue");

        const activeLoans = activeLoansData?.length || 0;
        const overdueLoans = overdueLoansData?.length || 0;

        const totalFines = [
          ...(activeLoansData || []),
          ...(overdueLoansData || []),
        ].reduce((sum, l) => sum + (l.fine || 0), 0);

        // Fetch recent loans
        const { data: recent } = await supabase
          .from("borrow_records")
          .select(
            `
            id,
            due_date,
            status,
            books:book_id (title),
            profiles:member_id (full_name)
          `,
          )
          .order("created_at", { ascending: false })
          .limit(5);

        const formattedLoans: RecentLoan[] = (recent || []).map(
          (loan: any) => ({
            id: loan.id,
            book_title: loan.books?.title || "Unknown Book",
            member_name: loan.profiles?.full_name || "Unknown Member",
            due_date: new Date(loan.due_date).toLocaleDateString(),
            status: loan.status,
          }),
        );

        setStats({
          totalBooks,
          totalCopies,
          totalMembers,
          activeMembers,
          activeLoans,
          overdueLoans,
          totalFines,
        });
        setRecentLoans(formattedLoans);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [includeMembers]);

  const links: QuickLink[] = [
    {
      label: "Books",
      desc: "Add, edit & search the catalogue",
      to: `${base}/books`,
      icon: BookOpen,
    },
    ...(includeMembers
      ? [
          {
            label: "Members",
            desc: "Manage member accounts",
            to: `${base}/members`,
            icon: Users,
          } as QuickLink,
        ]
      : []),
    {
      label: "Loans",
      desc: "Issue & return books",
      to: `${base}/loans`,
      icon: ArrowLeftRight,
    },
    {
      label: "Reports",
      desc: "Stats, risk & history",
      to: `${base}/reports`,
      icon: BarChart3,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid - Using your Lovable StatCard */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total books"
          value={stats.totalBooks}
          icon={BookOpen}
          hint={`${stats.totalCopies} copies`}
        />

        {includeMembers ? (
          <StatCard
            label="Members"
            value={stats.totalMembers}
            icon={Users}
            tone="gold"
            hint={`${stats.activeMembers} active`}
          />
        ) : (
          <StatCard
            label="Active loans"
            value={stats.activeLoans}
            icon={ArrowLeftRight}
            tone="gold"
          />
        )}

        <StatCard
          label="Books on loan"
          value={stats.activeLoans + stats.overdueLoans}
          icon={ArrowLeftRight}
          tone="success"
        />

        <StatCard
          label="Overdue"
          value={stats.overdueLoans}
          icon={AlertTriangle}
          tone="danger"
          hint={
            stats.overdueLoans > 0
              ? `₦${stats.totalFines.toLocaleString()} in fines`
              : "All on time"
          }
        />
      </div>

      {/* Quick Navigation */}
      <div>
        <h2 className="mb-3 font-serif text-lg font-semibold text-foreground">
          Quick navigation
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {links.map((l) => (
            <Link key={l.to} href={l.to}>
              <Card className="group h-full p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] bg-card border-border">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <l.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-base font-semibold text-foreground">
                  {l.label}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 shadow-[var(--shadow-soft)] bg-card border-border">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Recent activity
          </h2>
          <Link
            href={`${base}/loans`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recentLoans.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recent activity
            </p>
          ) : (
            recentLoans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {loan.book_title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {loan.member_name} · due {loan.due_date}
                  </p>
                </div>
                <Badge
                  variant={loan.status === "returned" ? "secondary" : "default"}
                  className={cn(
                    loan.status === "overdue" &&
                      "bg-danger text-danger-foreground",
                    loan.status === "active" &&
                      "bg-success text-success-foreground",
                    loan.status === "returned" &&
                      "bg-muted text-muted-foreground",
                  )}
                >
                  {loan.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
