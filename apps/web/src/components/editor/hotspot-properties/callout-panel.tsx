import type { HotspotStyle, PointerDirection } from "@porygon/shared";
import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";

import { parseCalloutStyle } from "../constants";
import { TooltipContentEditor } from "../tooltip-content-editor";

import type { EditorHotspot } from "@/stores/editor/types";

// ---------------------------------------------------------------------------
// Pointer Direction Picker
// ---------------------------------------------------------------------------

const DIRECTION_GRID: (PointerDirection | null)[][] = [
  ["top-left", "top", "top-right"],
  ["left", null, "right"],
  ["bottom-left", "bottom", "bottom-right"],
];

const DIRECTION_ARROWS: Record<PointerDirection, string> = {
  "top-left": "\u2196",
  top: "\u2191",
  "top-right": "\u2197",
  left: "\u2190",
  right: "\u2192",
  "bottom-left": "\u2199",
  bottom: "\u2193",
  "bottom-right": "\u2198",
};

function PointerDirectionPicker({
  value,
  onChange,
}: {
  value: PointerDirection;
  onChange: (dir: PointerDirection) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs font-medium">
        Pointer Direction
      </span>
      <div className="grid w-fit grid-cols-3 gap-1">
        {DIRECTION_GRID.flat().map((dir, i) =>
          dir ? (
            <button
              key={dir}
              type="button"
              onClick={() => onChange(dir)}
              data-active={value === dir || undefined}
              className="border-input hover:bg-accent data-active:border-primary data-active:bg-primary/10 flex size-7 items-center justify-center rounded border text-sm"
              title={dir}
            >
              <span
                className={
                  value === dir
                    ? "text-primary"
                    : "text-muted-foreground"
                }
              >
                {DIRECTION_ARROWS[dir]}
              </span>
            </button>
          ) : (
            <div key={`center-${i}`} className="size-7" />
          ),
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Callout Panel
// ---------------------------------------------------------------------------

interface CalloutPanelProps {
  hotspot: EditorHotspot;
  onTooltipContentChange: (json: Record<string, unknown>) => void;
  onStyleChange: (updates: Partial<HotspotStyle>) => void;
  onOpenByDefaultChange: (value: boolean) => void;
  onApplyToAll: () => void;
}

export function CalloutPanel({
  hotspot,
  onTooltipContentChange,
  onStyleChange,
  onOpenByDefaultChange,
  onApplyToAll,
}: CalloutPanelProps) {
  const { backgroundColor, textColor, pointerDirection, showButton, buttonText } =
    parseCalloutStyle(hotspot.style);

  return (
    <div className="flex flex-col gap-4">
      {/* Text Content */}
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          Text Content
        </span>
        <TooltipContentEditor
          content={hotspot.tooltipContent}
          hotspotId={hotspot.id}
          onChange={onTooltipContentChange}
        />
      </div>

      <div className="border-border border-t" />

      {/* Pointer Direction */}
      <PointerDirectionPicker
        value={pointerDirection}
        onChange={(dir) => onStyleChange({ pointerDirection: dir })}
      />

      <div className="border-border border-t" />

      {/* Colors */}
      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground text-xs font-medium">Style</span>

        <div className="flex items-center gap-2">
          <label htmlFor="callout-bg-color" className="min-w-16 text-xs">
            Background
          </label>
          <input
            id="callout-bg-color"
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
          <label htmlFor="callout-text-color" className="min-w-16 text-xs">
            Text
          </label>
          <input
            id="callout-text-color"
            type="color"
            value={textColor}
            onChange={(e) => onStyleChange({ textColor: e.target.value })}
            className="h-7 w-10 cursor-pointer rounded border-none bg-transparent p-0"
          />
          <span className="text-muted-foreground text-xs">{textColor}</span>
        </div>
      </div>

      <div className="border-border border-t" />

      {/* CTA Button */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showButton}
            onChange={(e) => onStyleChange({ showButton: e.target.checked })}
            className="accent-primary size-3.5 rounded"
          />
          <span className="text-xs">CTA button</span>
        </label>
        {showButton && (
          <Input
            value={buttonText}
            onChange={(e) => onStyleChange({ buttonText: e.target.value })}
            placeholder="Button text"
            maxLength={100}
            className="h-7 text-xs"
          />
        )}
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hotspot.openByDefault}
          onChange={(e) => onOpenByDefaultChange(e.target.checked)}
          className="accent-primary size-3.5 rounded"
        />
        <span className="text-xs">Open by default</span>
      </label>

      <div className="border-border border-t" />

      <Button
        variant="outline"
        size="sm"
        onClick={onApplyToAll}
        className="text-xs"
      >
        Apply to all Callouts
      </Button>
    </div>
  );
}
