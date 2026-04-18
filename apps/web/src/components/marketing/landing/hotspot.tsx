import { cn } from "@porygon/ui/lib/utils";

export function Hotspot({
  size = 14,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn("dot-hotspot", className)}
      style={{ width: size, height: size, ...style }}
    />
  );
}
