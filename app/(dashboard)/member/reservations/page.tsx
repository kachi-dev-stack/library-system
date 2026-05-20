import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReservationsClient from "./ReservationsClient";

export default async function ReservationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "member") redirect("/login");

  const [{ data: books }, { data: myReservations }] = await Promise.all([
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
    <ReservationsClient
      userId={user.id}
      books={(books ?? []) as any}
      myReservations={(myReservations ?? []) as any}
    />
  );
}
