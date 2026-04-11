import type { HotspotStyle, TooltipPosition } from "@porygon/shared";
import { TOOLTIP_POSITIONS } from "@porygon/shared/constants";

import { parseClickZoneStyle } from "../constants";
import { TooltipContentEditor } from "../tooltip-content-editor";

import type { EditorHotspot } from "@/stores/editor/types";

interface ClickZonePanelProps {
  hotspot: EditorHotspot;
  onTooltipContentChange: (json: Record<string, unknown>) => void;
  onTooltipPositionChange: (position: TooltipPosition) => void;
  onStyleChange: (updates: Partial<HotspotStyle>) => void;
  onOpenByDefaultChange: (value: boolean) => void;
}

export function ClickZonePanel({
  hotspot,
  onTooltipContentChange,
  onTooltipPositionChange,
  onStyleChange,
  onOpenByDefaultChange,
}: ClickZonePanelProps) {
  const { backgroundColor, textColor, opacity, pulseAnimation } =
    parseClickZoneStyle(hotspot.style);

  return (
    <div className="flex flex-col gap-4">
      {/* Tooltip Content */}
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          Tooltip Content
        </span>
        <TooltipContentEditor
          content={hotspot.tooltipContent}
          hotspotId={hotspot.id}
          onChange={onTooltipContentChange}
        />
      </div>

      {/* Tooltip Position */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="hotspot-tooltip-position"
          className="text-muted-foreground text-xs font-medium"
        >
          Tooltip Position
        </label>
        <select
          id="hotspot-tooltip-position"
          value={hotspot.tooltipPosition}
          onChange={(e) =>
            onTooltipPositionChange(e.target.value as TooltipPosition)
          }
          className="border-input bg-background text-foreground focus-visible:ring-ring h-8 w-full rounded-md border px-2 text-sm capitalize focus-visible:outline-none focus-visible:ring-1"
        >
          {TOOLTIP_POSITIONS.map((pos) => (
            <option key={pos} value={pos} className="capitalize">
              {pos.charAt(0).toUpperCase() + pos.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="border-border border-t" />

      {/* Style */}
      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-medium">Style</span>

        <div className="flex items-center gap-2">
          <label htmlFor="cz-bg-color" className="min-w-16 text-xs">
            Background
          </label>
          <input
            id="cz-bg-color"
            type="color"
            value={backgroundColor}
            onChange={(e) =>
              onStyleChange({ backgroundColor: e.target.value })
            }
            className="h-7 w-10 cursor-pointer rounded border-none bg-transparent p-0"
          />
          <span className="text-muted-foreground text-xs">
            {backgroundColor}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="cz-text-color" className="min-w-16 text-xs">
            Text
          </label>
          <input
            id="cz-text-color"
            type="color"
            value={textColor}
            onChange={(e) => onStyleChange({ textColor: e.target.value })}
            className="h-7 w-10 cursor-pointer rounded border-none bg-transparent p-0"
          />
          <span className="text-muted-foreground text-xs">{textColor}</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="cz-opacity" className="min-w-16 text-xs">
            Opacity
          </label>
          <input
            id="cz-opacity"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) =>
              onStyleChange({ opacity: parseFloat(e.target.value) })
            }
            className="h-1.5 flex-1"
          />
          <span className="text-muted-foreground w-8 text-right text-xs">
            {Math.round(opacity * 100)}%
          </span>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pulseAnimation}
            onChange={(e) =>
              onStyleChange({ pulseAnimation: e.target.checked })
            }
            className="accent-primary size-3.5 rounded"
          />
          <span className="text-xs">Pulse animation</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hotspot.openByDefault}
            onChange={(e) => onOpenByDefaultChange(e.target.checked)}
            className="accent-primary size-3.5 rounded"
          />
          <span className="text-xs">Open by default</span>
        </label>
      </div>
    </div>
  );
}
