import { cn } from "@/lib/utils";

export function BookCover({
  title,
  author,
  cover,
  className,
}: {
  title: string;
  author?: string;
  cover: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br p-3 text-left shadow-[var(--shadow-soft)]",
        cover,
        className,
      )}
    >
      <span className="absolute inset-y-0 left-1.5 w-1 rounded-full bg-white/20" />
      <span className="font-serif text-xs font-semibold leading-tight text-white drop-shadow line-clamp-3">
        {title}
      </span>
      {author && (
        <span className="text-[10px] text-white/80 line-clamp-1">{author}</span>
      )}
    </div>
  );
}
