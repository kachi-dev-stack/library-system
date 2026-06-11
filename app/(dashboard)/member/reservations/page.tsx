import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NotificationBell } from "@/components/NotificationBell";
import { memberNav } from "@/lib/nav-config";
import ReservationsClient from "./ReservationsClient";

export default async function ReservationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "member") redirect("/login");

  const [{ data: books }, { data: reservations }] = await Promise.all([
    supabase
      .from("books")
      .select("id, title, author, category, available_copies")
      .order("title"),
    supabase
      .from("reservations")
      .select(
        "id, status, reserved_at, book:books!reservations_book_id_fkey(id, title, author, available_copies)",
      )
      .eq("member_id", user.id)
      .order("reserved_at", { ascending: false }),
  ]);

  return (
    <DashboardLayout
      nav={memberNav}
      roleLabel="Member"
      userName={profile?.full_name || ""}
      title="Reservations"
      subtitle="Reserve unavailable books and track your requests"
      headerExtra={<NotificationBell />}
    >
      <ReservationsClient
        userId={user.id}
        books={(books ?? []) as any}
        myReservations={(reservations ?? []) as any}
      />
    </DashboardLayout>
  );
}
