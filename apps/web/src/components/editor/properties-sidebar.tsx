"use client";

import type { AnnotationSettings } from "@porygon/shared";
import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@porygon/ui/components/popover";
import { CircleHelp, Trash2 } from "lucide-react";

import {
  parseBlurSettings,
  parseCropSettings,
  parseHighlightSettings,
} from "./constants";
import { HotspotProperties } from "./hotspot-properties";

import { useAnnotationActions } from "@/hooks/editor/use-annotation-actions";
import { useEditorStore } from "@/stores/editor/editor-store-provider";

function AnnotationProperties() {
  const steps = useEditorStore((s) => s.steps);
  const selectedStepIndex = useEditorStore((s) => s.selectedStepIndex);
  const selectedAnnotationId = useEditorStore((s) => s.selectedAnnotationId);
  const updateAnnotation = useEditorStore((s) => s.updateAnnotation);

  const { saveAnnotation, deleteAnnotation } = useAnnotationActions();

  const selectedStep = steps[selectedStepIndex];
  const annotation = selectedStep?.annotations.find(
    (a) => a.id === selectedAnnotationId,
  );

  if (!annotation || !selectedStep) return null;

  const handleSettingsChange = (updates: Partial<AnnotationSettings>) => {
    const mergedSettings = { ...(annotation.settings ?? {}), ...updates };
    updateAnnotation(selectedStep.id, annotation.id, {
      settings: mergedSettings,
    });
    saveAnnotation(selectedStep.id, annotation.id, {
      settings: mergedSettings,
    });
  };

  const isBlur = annotation.type === "blur";
  const isHighlight = annotation.type === "highlight";
  const isCrop = annotation.type === "crop";

  const headerLabel = isCrop ? "Crop" : isBlur ? "Blur" : "Highlight";

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide">
            {headerLabel}
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
              {isCrop ? (
                <p>
                  Crop defines the visible area of the screenshot. The player
                  zooms into this region, hiding everything outside.
                </p>
              ) : isBlur ? (
                <p>
                  Blur hides sensitive information in your screenshots — like
                  customer names, emails, or financial data — so demos can be
                  shared publicly without exposing private content.
                </p>
              ) : (
                <p>
                  Highlight draws attention to a specific area of the screen,
                  guiding viewers to the exact feature or element you want them
                  to focus on in each step.
                </p>
              )}
            </PopoverContent>
          </Popover>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => deleteAnnotation(selectedStep.id, annotation.id)}
          title="Delete annotation"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Position / Size */}
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          Position &amp; Size
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">X</span>
            <Input
              value={Math.round(annotation.x)}
              readOnly
              className="h-7 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Y</span>
            <Input
              value={Math.round(annotation.y)}
              readOnly
              className="h-7 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Width</span>
            <Input
              value={Math.round(annotation.width)}
              readOnly
              className="h-7 text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Height</span>
            <Input
              value={Math.round(annotation.height)}
              readOnly
              className="h-7 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="border-border border-t" />

      {/* Crop Settings */}
      {isCrop && (
        <div className="flex flex-col gap-3">
          <span className="text-muted-foreground text-xs font-medium">
            Crop Settings
          </span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={parseCropSettings(annotation.settings).lockAspectRatio}
              onChange={(e) =>
                handleSettingsChange({ lockAspectRatio: e.target.checked })
              }
              className="accent-primary size-3.5 rounded"
            />
            <span className="text-xs">Lock aspect ratio</span>
          </label>
        </div>
      )}

      {/* Blur Settings */}
      {isBlur && (
        <div className="flex flex-col gap-3">
          <span className="text-muted-foreground text-xs font-medium">
            Blur Settings
          </span>
          <div className="flex items-center gap-2">
            <label
              htmlFor="blur-intensity"
              className="min-w-12.5 text-xs"
            >
              Intensity
            </label>
            <input
              id="blur-intensity"
              type="range"
              min={0}
              max={100}
              step={1}
              value={parseBlurSettings(annotation.settings).blurIntensity}
              onChange={(e) =>
                handleSettingsChange({
                  blurIntensity: parseInt(e.target.value, 10),
                })
              }
              className="h-1.5 flex-1"
            />
            <span className="text-muted-foreground w-8 text-right text-xs">
              {parseBlurSettings(annotation.settings).blurIntensity}px
            </span>
          </div>
        </div>
      )}

      {/* Highlight Settings */}
      {isHighlight && (
        <div className="flex flex-col gap-3">
          <span className="text-muted-foreground text-xs font-medium">
            Highlight Settings
          </span>
          <div className="flex items-center gap-2">
            <label
              htmlFor="highlight-color"
              className="min-w-12.5 text-xs"
            >
              Color
            </label>
            <input
              id="highlight-color"
              type="color"
              value={
                parseHighlightSettings(annotation.settings).highlightColor
              }
              onChange={(e) =>
                handleSettingsChange({ highlightColor: e.target.value })
              }
              className="h-7 w-10 cursor-pointer rounded border-none bg-transparent p-0"
            />
            <span className="text-muted-foreground text-xs">
              {parseHighlightSettings(annotation.settings).highlightColor}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="highlight-opacity"
              className="min-w-12.5 text-xs"
            >
              Opacity
            </label>
            <input
              id="highlight-opacity"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={
                parseHighlightSettings(annotation.settings).highlightOpacity
              }
              onChange={(e) =>
                handleSettingsChange({
                  highlightOpacity: parseFloat(e.target.value),
                })
              }
              className="h-1.5 flex-1"
            />
            <span className="text-muted-foreground w-8 text-right text-xs">
              {Math.round(
                parseHighlightSettings(annotation.settings)
                  .highlightOpacity * 100,
              )}
              %
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function PropertiesSidebar() {
  const title = useEditorStore((s) => s.demo.title);
  const description = useEditorStore((s) => s.demo.description);
  const updateDemo = useEditorStore((s) => s.updateDemo);
  const selectedHotspotId = useEditorStore((s) => s.selectedHotspotId);
  const selectedAnnotationId = useEditorStore((s) => s.selectedAnnotationId);

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
          ) : selectedAnnotationId ? (
            <div className="border-border border-t pt-4">
              <AnnotationProperties />
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
