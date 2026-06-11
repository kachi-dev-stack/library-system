"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { BookMarked, Search } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  available_copies: number;
};

type Reservation = {
  id: string;
  status: string;
  reserved_at: string;
  book: { id: string; title: string; author: string; available_copies: number };
};

const coverGradients = [
  "bg-gradient-to-br from-amber-600 to-orange-700",
  "bg-gradient-to-br from-emerald-600 to-teal-700",
  "bg-gradient-to-br from-blue-600 to-indigo-700",
  "bg-gradient-to-br from-rose-600 to-pink-700",
  "bg-gradient-to-br from-purple-600 to-violet-700",
  "bg-gradient-to-br from-slate-600 to-gray-700",
  "bg-gradient-to-br from-cyan-600 to-blue-700",
  "bg-gradient-to-br from-lime-600 to-green-700",
  "bg-gradient-to-br from-fuchsia-600 to-purple-700",
  "bg-gradient-to-br from-amber-600 to-yellow-700",
];

function getBookGradient(title: string): string {
  return coverGradients[title.length % coverGradients.length];
}

export default function ReservationsClient({
  userId,
  books,
  myReservations: initial,
}: {
  userId: string;
  books: Book[];
  myReservations: Reservation[];
}) {
  const [reservations, setReservations] = useState(initial);
  const [search, setSearch] = useState("");
  const [reserving, setReserving] = useState<string | null>(null);

  const supabase = createClient();

  const reservedBookIds = new Set(
    reservations.filter((r) => r.status === "pending").map((r) => r.book?.id),
  );

  const filteredBooks = books.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const activeReservations = reservations.filter((r) => r.status === "pending");
  const historyReservations = reservations.filter(
    (r) => r.status !== "pending",
  );

  const handleReserve = async (book: Book) => {
    setReserving(book.id);
    const { data, error } = await supabase
      .from("reservations")
      .insert({ member_id: userId, book_id: book.id, status: "pending" })
      .select(
        "id, status, reserved_at, book:books!reservations_book_id_fkey(id, title, author, available_copies)",
      )
      .single();

    if (error) {
      toast.error("Failed to reserve: " + error.message);
    } else {
      setReservations([data as any, ...reservations]);
      toast.success(`"${book.title}" reserved successfully`);
    }
    setReserving(null);
  };

  const handleCancel = async (reservationId: string) => {
    await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", reservationId);
    setReservations(
      reservations.map((r) =>
        r.id === reservationId ? { ...r, status: "cancelled" } : r,
      ),
    );
    toast.success("Reservation cancelled");
  };

  const resBadge = (status: string) => {
    if (status === "pending")
      return (
        <Badge className="bg-success text-success-foreground">Active</Badge>
      );
    if (status === "fulfilled")
      return <Badge className="bg-gold text-gold-foreground">Fulfilled</Badge>;
    return <Badge variant="secondary">Cancelled</Badge>;
  };

  return (
    <Tabs defaultValue="catalogue">
      <TabsList className="flex-wrap">
        <TabsTrigger value="catalogue">Browse catalogue</TabsTrigger>
        <TabsTrigger value="active">
          Active ({activeReservations.length})
        </TabsTrigger>
        <TabsTrigger value="history">
          History ({historyReservations.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="catalogue" className="mt-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books by title, author or category…"
              className="pl-9"
            />
          </div>
        </div>
        <div className="mb-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Books showing as{" "}
          <span className="font-medium text-danger">Unavailable</span> can be
          reserved. You will be notified when the book becomes available.
        </div>
        {filteredBooks.length === 0 ? (
          <Card className="grid place-items-center gap-2 p-12 text-center">
            <BookMarked className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-foreground">No books found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search term
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredBooks.map((b) => {
              const available = b.available_copies > 0;
              const isReserved = reservedBookIds.has(b.id);
              return (
                <Card
                  key={b.id}
                  className="flex flex-col p-3"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <BookCover
                    title={b.title}
                    author={b.author}
                    cover={getBookGradient(b.title)}
                    className="w-full"
                  />
                  <div className="mt-3 flex flex-1 flex-col">
                    <h3 className="line-clamp-1 font-serif text-sm font-semibold text-foreground">
                      {b.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{b.author}</p>
                    <span
                      className={`mt-1 text-xs font-medium ${available ? "text-success" : "text-danger"}`}
                    >
                      {available
                        ? `${b.available_copies} available`
                        : "Unavailable"}
                    </span>
                    {available ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="mt-3 w-full"
                      >
                        In stock
                      </Button>
                    ) : isReserved ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="mt-3 w-full"
                      >
                        Reserved
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => handleReserve(b)}
                        disabled={reserving === b.id}
                      >
                        {reserving === b.id ? "Reserving..." : "Reserve"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>

      <TabsContent value="active" className="mt-5">
        {activeReservations.length === 0 ? (
          <Card className="grid place-items-center gap-2 p-10 text-center text-muted-foreground">
            <BookMarked className="h-7 w-7" />
            <p>No active reservations.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeReservations.map((r) => (
              <Card
                key={r.id}
                className="flex items-center justify-between p-4"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div>
                  <p className="font-medium text-foreground">{r.book?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Reserved on {new Date(r.reserved_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {resBadge(r.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(r.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="history" className="mt-5">
        {historyReservations.length === 0 ? (
          <Card className="grid place-items-center gap-2 p-10 text-center text-muted-foreground">
            <BookMarked className="h-7 w-7" />
            <p>No reservation history.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {historyReservations.map((r) => (
              <Card
                key={r.id}
                className="flex items-center justify-between p-4"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div>
                  <p className="font-medium text-foreground">{r.book?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Reserved on {new Date(r.reserved_at).toLocaleDateString()}
                  </p>
                </div>
                {resBadge(r.status)}
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
