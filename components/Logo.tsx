import { BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif", className)}>
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg",
          variant === "light"
            ? "bg-gold text-gold-foreground"
            : "bg-[var(--gradient-hero)] text-primary-foreground",
        )}
      >
        <BookMarked className="h-4 w-4" />
      </span>
      <span
        className={cn(
          "text-xl font-semibold tracking-tight",
          variant === "light" ? "text-sidebar-foreground" : "text-foreground",
        )}
      >
        Libra
      </span>
    </span>
  );
}