"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StaffDashboard } from "@/components/modules/StaffDashboard";
import { adminNav } from "@/lib/nav-config";

type Profile = {
  full_name: string;
  email: string;
  role: string;
};

export default function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (p?.role !== "admin") {
        window.location.href = "/login";
        return;
      }

      setProfile(p);
    };

    fetchProfile();
  }, []);

  return (
    <DashboardLayout
      nav={adminNav}
      roleLabel="Administrator"
      userName={profile?.full_name || "Admin User"}
      title="Dashboard"
      subtitle="Library overview and quick navigation"
    >
      <StaffDashboard base="/admin" />
    </DashboardLayout>
  );
}
