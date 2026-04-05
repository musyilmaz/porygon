import { cn } from "@porygon/ui/lib/utils";

export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xl font-bold tracking-tight",
        variant === "light" ? "text-white" : "text-[#09090B]",
        className
      )}
    >
      dot
      {/* Animated hotspot dot */}
      <span className="relative flex size-3 items-center justify-center">
        {/* Pulsing rings */}
        <span
          className={cn(
            "dot-ring absolute inset-0 rounded-full",
            variant === "light" ? "bg-violet-400/40" : "bg-violet-500/30"
          )}
        />
        <span
          className={cn(
            "dot-ring-delayed absolute inset-0 rounded-full",
            variant === "light" ? "bg-violet-400/25" : "bg-violet-500/20"
          )}
        />
        {/* Core dot */}
        <span className="relative size-2.5 rounded-full bg-violet-500" />
      </span>
    </span>
  );
}
