import type { HotspotStyle } from "@porygon/shared";
import { Button } from "@porygon/ui/components/button";

import { parseAreaStyle } from "../constants";

import type { EditorHotspot } from "@/stores/editor/types";

interface AreaPanelProps {
  hotspot: EditorHotspot;
  onStyleChange: (updates: Partial<HotspotStyle>) => void;
  onApplyToAll: () => void;
}

export function AreaPanel({
  hotspot,
  onStyleChange,
  onApplyToAll,
}: AreaPanelProps) {
  const { borderColor, borderWidth, overlayColor, overlayOpacity, shape } =
    parseAreaStyle(hotspot.style);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-medium">
          Border
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="area-border-color" className="min-w-16 text-xs">
            Color
          </label>
          <input
            id="area-border-color"
            type="color"
            value={borderColor}
            onChange={(e) => onStyleChange({ borderColor: e.target.value })}
            className="h-7 w-10 cursor-pointer rounded border-none bg-transparent p-0"
          />
          <span className="text-muted-foreground text-xs">{borderColor}</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="area-border-width" className="min-w-16 text-xs">
            Width
          </label>
          <input
            id="area-border-width"
            type="range"
            min={0}
            max={10}
            step={1}
            value={borderWidth}
            onChange={(e) =>
              onStyleChange({ borderWidth: parseInt(e.target.value, 10) })
            }
            className="h-1.5 flex-1"
          />
          <span className="text-muted-foreground w-8 text-right text-xs">
            {borderWidth}px
          </span>
        </div>
      </div>

      <div className="border-border border-t" />

      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-medium">
          Overlay
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="area-overlay-color" className="min-w-16 text-xs">
            Color
          </label>
          <input
            id="area-overlay-color"
            type="color"
            value={overlayColor}
            onChange={(e) => onStyleChange({ overlayColor: e.target.value })}
            className="h-7 w-10 cursor-pointer rounded border-none bg-transparent p-0"
          />
          <span className="text-muted-foreground text-xs">{overlayColor}</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="area-overlay-opacity" className="min-w-16 text-xs">
            Opacity
          </label>
          <input
            id="area-overlay-opacity"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={overlayOpacity}
            onChange={(e) =>
              onStyleChange({ overlayOpacity: parseFloat(e.target.value) })
            }
            className="h-1.5 flex-1"
          />
          <span className="text-muted-foreground w-8 text-right text-xs">
            {Math.round(overlayOpacity * 100)}%
          </span>
        </div>
      </div>

      <div className="border-border border-t" />

      {/* Shape */}
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">Shape</span>
        <div className="flex gap-1">
          <Button
            variant={shape === "rectangle" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onStyleChange({ shape: "rectangle" })}
            className="flex-1 text-xs"
          >
            Rectangle
          </Button>
          <Button
            variant={shape === "rounded" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onStyleChange({ shape: "rounded" })}
            className="flex-1 text-xs"
          >
            Rounded
          </Button>
        </div>
      </div>

      <div className="border-border border-t" />

      <Button
        variant="outline"
        size="sm"
        onClick={onApplyToAll}
        className="text-xs"
      >
        Apply to all Areas
      </Button>
    </div>
  );
}
