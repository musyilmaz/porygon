"use client";

import type { HotspotStyle, HotspotType, TooltipPosition } from "@porygon/shared";
import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@porygon/ui/components/popover";
import { CircleHelp, Trash2 } from "lucide-react";

import { parseAreaStyle, parseCalloutStyle } from "../constants";

import { AreaPanel } from "./area-panel";
import { CalloutPanel } from "./callout-panel";
import { ClickZonePanel } from "./click-zone-panel";
import { TypeSelector } from "./type-selector";

import { useHotspotActions } from "@/hooks/editor/use-hotspot-actions";
import { useEditorStore } from "@/stores/editor/editor-store-provider";

export function HotspotProperties() {
  const steps = useEditorStore((s) => s.steps);
  const selectedStepIndex = useEditorStore((s) => s.selectedStepIndex);
  const selectedHotspotId = useEditorStore((s) => s.selectedHotspotId);
  const updateHotspot = useEditorStore((s) => s.updateHotspot);

  const { saveHotspot, deleteHotspot, applyStyleToAll } = useHotspotActions();

  const selectedStep = steps[selectedStepIndex];
  const hotspot = selectedStep?.hotspots.find(
    (h) => h.id === selectedHotspotId,
  );

  if (!hotspot || !selectedStep) return null;

  // ---- Shared handlers ----

  const handleTypeChange = (type: HotspotType) => {
    if (type === hotspot.type) return;
    const updates = {
      type,
      style: null,
      tooltipContent: null,
      tooltipPosition: "bottom" as TooltipPosition,
      openByDefault: false,
    };
    updateHotspot(selectedStep.id, hotspot.id, updates);
    saveHotspot(selectedStep.id, hotspot.id, updates);
  };

  const handleStyleChange = (updates: Partial<HotspotStyle>) => {
    const mergedStyle = { ...(hotspot.style ?? {}), ...updates };
    updateHotspot(selectedStep.id, hotspot.id, { style: mergedStyle });
    saveHotspot(selectedStep.id, hotspot.id, { style: mergedStyle });
  };

  const handleTooltipContentChange = (json: Record<string, unknown>) => {
    updateHotspot(selectedStep.id, hotspot.id, { tooltipContent: json });
    saveHotspot(selectedStep.id, hotspot.id, { tooltipContent: json });
  };

  const handleTooltipPositionChange = (value: TooltipPosition) => {
    updateHotspot(selectedStep.id, hotspot.id, { tooltipPosition: value });
    saveHotspot(selectedStep.id, hotspot.id, { tooltipPosition: value });
  };

  const handleOpenByDefaultChange = (value: boolean) => {
    updateHotspot(selectedStep.id, hotspot.id, { openByDefault: value });
    saveHotspot(selectedStep.id, hotspot.id, { openByDefault: value });
  };

  const handleTargetStepChange = (value: string) => {
    const targetStepId = value === "" ? null : value;
    updateHotspot(selectedStep.id, hotspot.id, { targetStepId });
    saveHotspot(selectedStep.id, hotspot.id, { targetStepId });
  };

  const handleApplyToAllArea = () => {
    const { borderColor, borderWidth, overlayColor, overlayOpacity, shape } =
      parseAreaStyle(hotspot.style);
    applyStyleToAll(
      "area",
      { borderColor, borderWidth, overlayColor, overlayOpacity, shape },
      hotspot.id,
    );
  };

  const handleApplyToAllCallout = () => {
    const { backgroundColor, textColor, pointerDirection, showButton, buttonText } =
      parseCalloutStyle(hotspot.style);
    applyStyleToAll(
      "callout",
      { backgroundColor, textColor, pointerDirection, showButton, buttonText },
      hotspot.id,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide">
            Hotspot
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground size-5"
              >
                <CircleHelp className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="left" className="w-64 text-sm">
              <p>
                Hotspots are interactive clickable areas on your demo. Viewers
                click them to navigate between steps or see tooltip information.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => deleteHotspot(selectedStep.id, hotspot.id)}
          title="Delete hotspot"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Type Selector */}
      <TypeSelector value={hotspot.type} onChange={handleTypeChange} />

      <div className="border-border border-t" />

      {/* Position / Size */}
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          Position &amp; Size
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">X</span>
            <Input
              value={Math.round(hotspot.x)}
              readOnly
              className="h-7 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Y</span>
            <Input
              value={Math.round(hotspot.y)}
              readOnly
              className="h-7 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Width</span>
            <Input
              value={Math.round(hotspot.width)}
              readOnly
              className="h-7 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Height</span>
            <Input
              value={Math.round(hotspot.height)}
              readOnly
              className="h-7 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="border-border border-t" />

      {/* Type-specific panel */}
      {hotspot.type === "click_zone" && (
        <ClickZonePanel
          hotspot={hotspot}
          onTooltipContentChange={handleTooltipContentChange}
          onTooltipPositionChange={handleTooltipPositionChange}
          onStyleChange={handleStyleChange}
          onOpenByDefaultChange={handleOpenByDefaultChange}
        />
      )}

      {hotspot.type === "area" && (
        <AreaPanel
          hotspot={hotspot}
          onStyleChange={handleStyleChange}
          onApplyToAll={handleApplyToAllArea}
        />
      )}

      {hotspot.type === "callout" && (
        <CalloutPanel
          hotspot={hotspot}
          onTooltipContentChange={handleTooltipContentChange}
          onStyleChange={handleStyleChange}
          onOpenByDefaultChange={handleOpenByDefaultChange}
          onApplyToAll={handleApplyToAllCallout}
        />
      )}

      <div className="border-border border-t" />

      {/* Branching (shared) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="hotspot-target-step"
          className="text-muted-foreground text-xs font-medium"
        >
          Destination
        </label>
        <select
          id="hotspot-target-step"
          value={hotspot.targetStepId ?? ""}
          onChange={(e) => handleTargetStepChange(e.target.value)}
          className="border-input bg-background text-foreground focus-visible:ring-ring h-8 w-full rounded-md border px-2 text-sm focus-visible:outline-none focus-visible:ring-1"
        >
          <option value="">None (no branching)</option>
          {steps.map((step, index) => {
            if (step.id === selectedStep.id) return null;
            return (
              <option key={step.id} value={step.id}>
                Step {index + 1}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
