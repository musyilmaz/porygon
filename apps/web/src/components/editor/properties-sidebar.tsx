"use client";

import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";
import { Trash2 } from "lucide-react";

import { useHotspotActions } from "@/hooks/editor/use-hotspot-actions";
import { useEditorStore } from "@/stores/editor/editor-store-provider";

function HotspotProperties() {
  const steps = useEditorStore((s) => s.steps);
  const selectedStepIndex = useEditorStore((s) => s.selectedStepIndex);
  const selectedHotspotId = useEditorStore((s) => s.selectedHotspotId);
  const updateHotspot = useEditorStore((s) => s.updateHotspot);

  const { saveHotspot, deleteHotspot } = useHotspotActions();

  const selectedStep = steps[selectedStepIndex];
  const hotspot = selectedStep?.hotspots.find(
    (h) => h.id === selectedHotspotId,
  );

  if (!hotspot || !selectedStep) return null;

  const handleTargetStepChange = (value: string) => {
    const targetStepId = value === "" ? null : value;
    updateHotspot(selectedStep.id, hotspot.id, { targetStepId });
    saveHotspot(selectedStep.id, hotspot.id, { targetStepId });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide">
          Hotspot
        </span>
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

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="hotspot-target-step"
          className="text-muted-foreground text-xs font-medium"
        >
          Target Step
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

export function PropertiesSidebar() {
  const title = useEditorStore((s) => s.demo.title);
  const description = useEditorStore((s) => s.demo.description);
  const updateDemo = useEditorStore((s) => s.updateDemo);
  const selectedHotspotId = useEditorStore((s) => s.selectedHotspotId);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-border flex h-10 shrink-0 items-center border-b px-3">
        <span className="text-xs font-medium uppercase tracking-wide">
          Properties
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="demo-title"
              className="text-muted-foreground text-xs font-medium"
            >
              Title
            </label>
            <Input
              id="demo-title"
              value={title}
              onChange={(e) => updateDemo({ title: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="demo-description"
              className="text-muted-foreground text-xs font-medium"
            >
              Description
            </label>
            <textarea
              id="demo-description"
              value={description ?? ""}
              onChange={(e) =>
                updateDemo({
                  description: e.target.value || null,
                })
              }
              rows={3}
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1"
            />
          </div>

          {selectedHotspotId ? (
            <div className="border-border border-t pt-4">
              <HotspotProperties />
            </div>
          ) : (
            <div className="border-border border-t pt-4">
              <span className="text-muted-foreground text-xs font-medium">
                Hotspot and annotation properties will appear here when
                selected.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
