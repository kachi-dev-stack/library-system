"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Search,
  UserX,
  UserCheck,
  Users,
  X,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
};

interface MembersClientProps {
  members: Member[];
}

export default function MembersClient({
  members: initial,
}: MembersClientProps) {
  const [members, setMembers] = useState(initial);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const supabase = createClient();

  const filtered = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const resetForm = () => {
    setForm({
      full_name: "",
      email: "",
      phone: "",
      password: "",
    });
    setShowPassword(false);
  };

  const handleAdd = async () => {
    if (!form.full_name || !form.email || !form.password) {
      toast.error("Name, email and password are required");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/members/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();
    if (!res.ok) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    setMembers([result.member, ...members]);
    toast.success("Member added successfully");
    setFormOpen(false);
    resetForm();
    setLoading(false);
  };

  const toggleStatus = async (member: Member) => {
    const newStatus = member.status === "active" ? "suspended" : "active";
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", member.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setMembers(
      members.map((m) =>
        m.id === member.id ? { ...m, status: newStatus } : m,
      ),
    );
    toast.success(
      `${member.full_name} ${newStatus === "active" ? "activated" : "suspended"}`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name or email…"
            className="pl-9"
          />
        </div>
        <Button onClick={() => setFormOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" /> Add member
        </Button>
      </div>

      {/* Members Table */}
      {filtered.length === 0 ? (
        <Card className="grid place-items-center gap-2 p-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No members match your search.</p>
        </Card>
      ) : (
        <Card
          className="overflow-hidden"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {member.full_name?.charAt(0)}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">
                            {member.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {member.status === "active" ? (
                        <Badge className="bg-success text-success-foreground">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-danger text-danger-foreground">
                          Suspended
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {member.status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-danger hover:text-danger"
                          onClick={() => toggleStatus(member)}
                        >
                          <UserX className="h-3.5 w-3.5" /> Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStatus(member)}
                        >
                          <UserCheck className="h-3.5 w-3.5" /> Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Member Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Add a new member</DialogTitle>
            <DialogDescription>
              Create a library account for a new member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="Amara Nwosu"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="amara@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Min. 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={loading}>
              {loading ? "Adding..." : "Add member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
