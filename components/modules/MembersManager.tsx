import { useState } from "react";
import { Plus, UserPlus, Ban, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { members as seed } from "@/lib/library-data";
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

export function MembersManager() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = seed.filter(
    (m) =>
      !query ||
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members…"
            className="pl-9"
          />
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" /> Add member
        </Button>
      </div>

      <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Active loans</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {m.name.charAt(0)}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.joined}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.activeLoans}</td>
                  <td className="px-4 py-3">
                    {m.status === "active" ? (
                      <Badge className="bg-success text-success-foreground">Active</Badge>
                    ) : (
                      <Badge className="bg-danger text-danger-foreground">Suspended</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-danger hover:text-danger"
                        onClick={() => toast.success(`${m.name} suspended`)}
                      >
                        <Ban className="h-3.5 w-3.5" /> Suspend
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success(`${m.name} reactivated`)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Add a new member</DialogTitle>
            <DialogDescription>Create a library account for a new member.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              toast.success("Member added");
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Amara Nwosu" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="amara@example.com" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <UserPlus className="h-4 w-4" /> Add member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}