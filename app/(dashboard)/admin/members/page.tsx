"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import MembersClient from "./MembersClient";
import { adminNav, librarianNav } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  role: string;
  full_name: string;
};

type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
};

export default function MembersPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (!["admin", "librarian"].includes(profileData?.role)) {
        router.push("/login");
        return;
      }

      const { data: membersData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "member")
        .order("created_at", { ascending: false });

      setProfile(profileData);
      setMembers(membersData || []);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";
  const nav = isAdmin ? adminNav : librarianNav;
  const roleLabel = isAdmin ? "Administrator" : "Librarian";

  return (
    <DashboardLayout
      nav={nav}
      roleLabel={roleLabel}
      userName={profile?.full_name || "User"}
      title="Members"
      subtitle="Manage member accounts"
    >
      <MembersClient members={members} />
    </DashboardLayout>
  );
}
