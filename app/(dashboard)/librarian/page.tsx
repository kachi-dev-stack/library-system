"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

import { librarianNav } from "@/lib/nav-config";
import { createClient } from "@/lib/supabase/client";
import { StaffDashboard } from "@/components/modules/StaffDashboard";

type Profile = {
  role: string;
  full_name: string;
};

export default function LibrarianDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
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

      if (profileData?.role !== "librarian") {
        router.push("/login");
        return;
      }

      setProfile(profileData);
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

  return (
    <DashboardLayout
      nav={librarianNav}
      roleLabel="Librarian"
      userName={profile?.full_name || "Librarian"}
      title="Dashboard"
      subtitle="Library overview and quick navigation"
    >
      <StaffDashboard base="/librarian" />
    </DashboardLayout>
  );
}
