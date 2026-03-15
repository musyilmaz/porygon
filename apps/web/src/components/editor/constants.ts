import type { AnnotationSettings, HotspotStyle, Nullable } from "@porygon/shared";

import { hexToRgb } from "@/lib/editor/color-utils";
import type { EditorAnnotation } from "@/stores/editor/types";

// ---------------------------------------------------------------------------
// Hotspot defaults
// ---------------------------------------------------------------------------

/** Default RGB for hotspots that branch to another step (green-500) */
export const HOTSPOT_BRANCHING_RGB = "34, 197, 94";

/** Default RGB for standard hotspots (blue-500) */
export const HOTSPOT_DEFAULT_RGB = "59, 130, 246";

/** Default hex color shown in the style picker (blue-500) */
export const HOTSPOT_DEFAULT_COLOR = "#3b82f6";

/** Default fill opacity for hotspot overlays */
export const HOTSPOT_DEFAULT_OPACITY = 0.3;

export interface ParsedHotspotStyle {
  backgroundColor: string;
  opacity: number;
  pulseAnimation: boolean;
}

export function parseHotspotStyle(
  style: Nullable<HotspotStyle> | undefined,
): ParsedHotspotStyle {
  return {
    backgroundColor: style?.backgroundColor ?? HOTSPOT_DEFAULT_COLOR,
    opacity: style?.opacity ?? HOTSPOT_DEFAULT_OPACITY,
    pulseAnimation: style?.pulseAnimation ?? false,
  };
}

// ---------------------------------------------------------------------------
// Annotation defaults
// ---------------------------------------------------------------------------

/** Default blur intensity (px) */
export const ANNOTATION_DEFAULT_BLUR_INTENSITY = 10;

/** Default highlight color (yellow-500) */
export const ANNOTATION_DEFAULT_HIGHLIGHT_COLOR = "#eab308";

/** Default highlight fill opacity */
export const ANNOTATION_DEFAULT_HIGHLIGHT_OPACITY = 0.25;

export interface ParsedBlurSettings {
  blurIntensity: number;
}

export interface ParsedHighlightSettings {
  highlightColor: string;
  highlightOpacity: number;
}

export function parseBlurSettings(
  settings: Nullable<AnnotationSettings> | undefined,
): ParsedBlurSettings {
  return {
    blurIntensity: settings?.blurIntensity ?? ANNOTATION_DEFAULT_BLUR_INTENSITY,
  };
}

export function parseHighlightSettings(
  settings: Nullable<AnnotationSettings> | undefined,
): ParsedHighlightSettings {
  return {
    highlightColor: settings?.highlightColor ?? ANNOTATION_DEFAULT_HIGHLIGHT_COLOR,
    highlightOpacity: settings?.highlightOpacity ?? ANNOTATION_DEFAULT_HIGHLIGHT_OPACITY,
  };
}

// ---------------------------------------------------------------------------
// Canvas overlay colors
// ---------------------------------------------------------------------------

/** Base colors used when rendering annotations on the canvas */
export const ANNOTATION_COLORS: Record<
  EditorAnnotation["type"],
  { fill: string; stroke: string }
> = {
  blur: { fill: "rgba(107, 114, 128, 0.4)", stroke: "rgba(107, 114, 128, 0.7)" },
  highlight: {
    fill: "rgba(234, 179, 8, 0.25)",
    stroke: "rgba(234, 179, 8, 0.7)",
  },
  crop: { fill: "rgba(0, 0, 0, 0.5)", stroke: "rgba(0, 0, 0, 0.8)" },
};

/** Resolves an annotation's effective fill/stroke colors from its settings */
export function getAnnotationColors(
  annotation: EditorAnnotation,
): { fill: string; stroke: string } {
  if (annotation.type === "highlight") {
    const { highlightColor, highlightOpacity } = parseHighlightSettings(
      annotation.settings,
    );
    const rgb = hexToRgb(highlightColor);
    if (rgb) {
      return {
        fill: `rgba(${rgb}, ${highlightOpacity})`,
        stroke: `rgba(${rgb}, 0.7)`,
      };
    }
  }
  return ANNOTATION_COLORS[annotation.type];
}

/** Colors shown for the drawing preview rectangle per tool */
export const PREVIEW_COLORS: Record<string, { fill: string; stroke: string }> = {
  hotspot: { fill: "rgba(59, 130, 246, 0.15)", stroke: "rgba(59, 130, 246, 0.8)" },
  blur: { fill: "rgba(107, 114, 128, 0.15)", stroke: "rgba(107, 114, 128, 0.8)" },
  highlight: { fill: "rgba(234, 179, 8, 0.15)", stroke: "rgba(234, 179, 8, 0.8)" },
  crop: { fill: "rgba(255, 255, 255, 0.05)", stroke: "rgba(255, 255, 255, 0.9)" },
};

export interface ParsedCropSettings {
  lockAspectRatio: boolean;
}

export function parseCropSettings(
  settings: Nullable<AnnotationSettings> | undefined,
): ParsedCropSettings {
  return {
    lockAspectRatio: settings?.lockAspectRatio ?? true,
  };
}

// ---------------------------------------------------------------------------
// Drawing tool helpers
// ---------------------------------------------------------------------------

/** Minimum width/height (in image pixels) for a drawn element */
export const MIN_DRAW_SIZE = 20;

const DRAWING_TOOLS = new Set(["hotspot", "blur", "highlight", "crop"] as const);

export function isDrawingTool(tool: string): tool is "hotspot" | "blur" | "highlight" | "crop" {
  return DRAWING_TOOLS.has(tool as "hotspot" | "blur" | "highlight" | "crop");
}

// ---------------------------------------------------------------------------
// Keyboard shortcuts
// ---------------------------------------------------------------------------

export interface ShortcutEntry {
  keys: string[];
  label: string;
}

export interface ShortcutCategory {
  category: string;
  shortcuts: ShortcutEntry[];
}

export const EDITOR_SHORTCUTS: ShortcutCategory[] = [
  {
    category: "Tools",
    shortcuts: [
      { keys: ["V"], label: "Select tool" },
      { keys: ["H"], label: "Hotspot tool" },
      { keys: ["B"], label: "Blur tool" },
      { keys: ["Y"], label: "Highlight tool" },
      { keys: ["C"], label: "Crop tool" },
    ],
  },
  {
    category: "Actions",
    shortcuts: [
      { keys: ["mod", "Z"], label: "Undo" },
      { keys: ["mod", "Shift", "Z"], label: "Redo" },
      { keys: ["mod", "P"], label: "Preview" },
      { keys: ["Delete"], label: "Delete selected" },
      { keys: ["Escape"], label: "Deselect / reset tool" },
      { keys: ["?"], label: "Keyboard shortcuts" },
    ],
  },
];
