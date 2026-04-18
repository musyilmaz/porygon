import { cn } from "@porygon/ui/lib/utils";

export function Logo({
  className,
  size = "md",
  tone = "ink",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "ink" | "invert";
}) {
  const sizes = {
    sm: { text: "text-base", dotOuter: "size-3", dotCore: "size-2" },
    md: { text: "text-xl", dotOuter: "size-3.5", dotCore: "size-2.5" },
    lg: { text: "text-2xl", dotOuter: "size-4", dotCore: "size-3" },
  };
  const s = sizes[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold tracking-[-0.04em]",
        tone === "invert" ? "text-background" : "text-foreground",
        s.text,
        className,
      )}
    >
      dot
      <span
        className={cn(
          "relative inline-flex items-center justify-center",
          s.dotOuter,
        )}
      >
        <span className="dot-ring absolute inset-0 rounded-full bg-primary/30" />
        <span className="dot-ring-delayed absolute inset-0 rounded-full bg-primary/20" />
        <span className={cn("relative rounded-full bg-primary", s.dotCore)} />
      </span>
    </span>
  );
}
