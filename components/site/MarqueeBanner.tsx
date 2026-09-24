import { cn } from "@/lib/utils";

export function MarqueeBanner({
  items,
  className,
  bg = "bg-ink",
  text = "text-lime",
  reverse = false,
  speed = "marquee",
}: {
  items: string[];
  className?: string;
  bg?: string;
  text?: string;
  reverse?: boolean;
  speed?: "marquee" | "marquee-slow" | "marquee-fast";
}) {
  const row = [...items, ...items, ...items];
  return (
    <div className={cn("overflow-hidden py-2", bg, text, className)}>
      <div className={cn("flex w-max items-center", reverse ? "marquee-rev" : speed)}>
        {row.map((it, i) => (
          <span key={i} className="pixel flex items-center whitespace-nowrap text-[11px]">
            <span className="px-4">{it}</span>
            <span className="opacity-70">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
