import type { NavItem } from "@/components/DashboardLayout";

export const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: "dashboard" },
  { label: "Books", to: "/admin/books", icon: "books" },
  { label: "Members", to: "/admin/members", icon: "members" },
  { label: "Loans", to: "/admin/loans", icon: "loans" },
  { label: "Reports", to: "/admin/reports", icon: "reports" },
];

export const librarianNav: NavItem[] = [
  { label: "Dashboard", to: "/librarian", icon: "dashboard" },
  { label: "Books", to: "/librarian/books", icon: "books" },
  { label: "Loans", to: "/librarian/loans", icon: "loans" },
  { label: "Reports", to: "/librarian/reports", icon: "reports" },
];

export const memberNav: NavItem[] = [
  { label: "Dashboard", to: "/member", icon: "dashboard" },
  { label: "Reservations", to: "/member/reservations", icon: "reservations" },
];
