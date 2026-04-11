import type { HotspotType } from "@porygon/shared";
import { Button } from "@porygon/ui/components/button";
import { Crosshair, MessageSquare, SquareDashed } from "lucide-react";

const TYPE_OPTIONS: { type: HotspotType; label: string; Icon: typeof Crosshair }[] = [
  { type: "click_zone", label: "Click Zone", Icon: Crosshair },
  { type: "area", label: "Area", Icon: SquareDashed },
  { type: "callout", label: "Callout", Icon: MessageSquare },
];

interface TypeSelectorProps {
  value: HotspotType;
  onChange: (type: HotspotType) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs font-medium">Type</span>
      <div className="flex gap-1">
        {TYPE_OPTIONS.map(({ type, label, Icon }) => (
          <Button
            key={type}
            variant={value === type ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onChange(type)}
            className="flex-1 gap-1.5"
            title={label}
          >
            <Icon className="size-3.5" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
