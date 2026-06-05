import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  BarChart3,
  BookMarked,
} from "lucide-react";
import type { NavItem } from "@/components/DashboardLayout";

export const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Books", to: "/admin/books", icon: BookOpen },
  { label: "Members", to: "/admin/members", icon: Users },
  { label: "Loans", to: "/admin/loans", icon: ArrowLeftRight },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
];

export const librarianNav: NavItem[] = [
  { label: "Dashboard", to: "/librarian", icon: LayoutDashboard },
  { label: "Books", to: "/librarian/books", icon: BookOpen },
  { label: "Loans", to: "/librarian/loans", icon: ArrowLeftRight },
  { label: "Reports", to: "/librarian/reports", icon: BarChart3 },
];

export const memberNav: NavItem[] = [
  { label: "Dashboard", to: "/member", icon: LayoutDashboard },
  { label: "Reservations", to: "/member/reservations", icon: BookMarked },
];