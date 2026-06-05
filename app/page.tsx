"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  Sparkles,
  Bell,
  ShieldCheck,
  ArrowRight,
  Library,
  Quote,
  Star,
  Check,
  BookMarked,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const heroImg = "/library-hero.jpg";

const features = [
  {
    icon: BookOpen,
    title: "Catalogue management",
    desc: "Add, edit, search and track every book and its available copies in real time.",
  },
  {
    icon: ArrowLeftRight,
    title: "Loans & returns",
    desc: "Issue books, auto-calculate due dates and apply late fines at ₦50 per day.",
  },
  {
    icon: Users,
    title: "Member accounts",
    desc: "Onboard members, suspend or reactivate them, and follow their borrowing.",
  },
  {
    icon: Sparkles,
    title: "AI recommendations",
    desc: "Members get personalised book suggestions based on what they've read.",
  },
  {
    icon: ShieldCheck,
    title: "AI risk detection",
    desc: "Flag members likely to return late, ranked from medium to high risk.",
  },
  {
    icon: Bell,
    title: "Smart reservations",
    desc: "Reserve unavailable books and get notified the moment they're back.",
  },
];

const stats = [
  { value: "3", label: "User Roles" },
  { value: "AI", label: "Powered Insights" },
  { value: "Auto", label: "Fine Calculation" },
  { value: "Live", label: "Book Tracking" },
];

const roles = [
  {
    icon: ShieldCheck,
    title: "For admins",
    desc: "Full control over books, members, loans and reports.",
    points: [
      "Manage the whole catalogue",
      "Onboard & suspend members",
      "Library-wide reports",
    ],
  },
  {
    icon: Library,
    title: "For librarians",
    desc: "Everything you need for day-to-day desk operations.",
    points: [
      "Issue & return books",
      "Track overdue loans",
      "View borrowing reports",
    ],
  },
  {
    icon: BookOpen,
    title: "For members",
    desc: "A delightful way to borrow, reserve and discover books.",
    points: [
      "Browse the catalogue",
      "Reserve & get notified",
      "AI recommendations",
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="inline-flex items-center gap-2 font-serif">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <BookMarked className="h-4 w-4" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Libra
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero with Stats inside */}
      <section className="relative overflow-hidden">
        <Image
          src={heroImg}
          alt="A warm, sunlit library reading room lined with bookshelves"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
            <Sparkles className="h-3.5 w-3.5" /> Now with AI insights
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            The calm way to run your library.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
            Libra brings books, members, loans and reservations together in one
            elegant workspace — with smart recommendations and risk detection
            built in.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="xl"
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              <Link href="/signup">
                Create an account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>

          {/* Stats bar - moved inside hero */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/5 px-4 py-5 text-center backdrop-blur-sm"
                >
                  <p className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-white/70 sm:text-sm">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything your library needs
          </h2>
          <p className="mt-3 text-muted-foreground">
            Purpose-built dashboards for admins, librarians and members.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className="group p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Role cards */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Built for every role
            </h2>
            <p className="mt-3 text-muted-foreground">
              One platform, three tailored experiences.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {roles.map((r) => (
              <Card key={r.title} className="flex flex-col p-7 shadow-md">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <r.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">
                  {r.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{r.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {r.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2.5 text-sm text-foreground"
                    >
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 px-8 py-14 text-center shadow-lg">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Join Libra today and bring order, insight and delight to your
            library.
          </p>
          <Button
            asChild
            size="xl"
            className="mt-7 bg-gold text-gold-foreground hover:bg-gold/90"
          >
            <Link href="/signup">
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© 2026 Libra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
