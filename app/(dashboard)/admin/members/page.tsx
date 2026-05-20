import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MembersClient from "./MembersClient";

export default async function MembersPage() {
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

  if (!["admin", "librarian"].includes(profile?.role)) redirect("/login");

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "member")
    .order("created_at", { ascending: false });

  return <MembersClient members={members ?? []} />;
}
