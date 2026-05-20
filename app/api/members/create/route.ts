import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { full_name, email, phone, password } = await request.json();

  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: "member" },
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  if (phone) {
    await supabase.from("profiles").update({ phone }).eq("id", data.user.id);
  }

  const { data: member } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return NextResponse.json({ member });
}
