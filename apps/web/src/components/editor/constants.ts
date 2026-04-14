import type { AnnotationSettings, HotspotStyle, Nullable, PointerDirection } from "@porygon/shared";

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
// Click Zone rendering constants
// ---------------------------------------------------------------------------

/** Duration of the pulse animation cycle in seconds */
export const CLICK_ZONE_PULSE_DURATION = 1.2;

/** Maximum scale for the pulse ring animation */
export const CLICK_ZONE_PULSE_SCALE = 1.6;

// ---------------------------------------------------------------------------
// Callout rendering constants
// ---------------------------------------------------------------------------

/** Height of the callout pointer triangle in pixels */
export const CALLOUT_POINTER_HEIGHT = 12;

/** Base width of the callout pointer triangle in pixels */
export const CALLOUT_POINTER_BASE = 20;

/** Corner radius for the callout body rectangle */
export const CALLOUT_BODY_CORNER_RADIUS = 8;

// ---------------------------------------------------------------------------
// Click Zone style defaults
// ---------------------------------------------------------------------------

export const CLICK_ZONE_DEFAULT_TEXT_COLOR = "#ffffff";

export interface ParsedClickZoneStyle {
  backgroundColor: string;
  textColor: string;
  opacity: number;
  pulseAnimation: boolean;
}

export function parseClickZoneStyle(
  style: Nullable<HotspotStyle> | undefined,
): ParsedClickZoneStyle {
  return {
    backgroundColor: style?.backgroundColor ?? HOTSPOT_DEFAULT_COLOR,
    textColor: style?.textColor ?? CLICK_ZONE_DEFAULT_TEXT_COLOR,
    opacity: style?.opacity ?? HOTSPOT_DEFAULT_OPACITY,
    pulseAnimation: style?.pulseAnimation ?? false,
  };
}

// ---------------------------------------------------------------------------
// Area style defaults
// ---------------------------------------------------------------------------

export const AREA_DEFAULT_BORDER_COLOR = "#3b82f6";
export const AREA_DEFAULT_BORDER_WIDTH = 2;
export const AREA_DEFAULT_OVERLAY_COLOR = "#3b82f6";
export const AREA_DEFAULT_OVERLAY_OPACITY = 0.15;
export const AREA_DEFAULT_SHAPE: "rectangle" | "rounded" = "rectangle";

export interface ParsedAreaStyle {
  borderColor: string;
  borderWidth: number;
  overlayColor: string;
  overlayOpacity: number;
  shape: "rectangle" | "rounded";
}

export function parseAreaStyle(
  style: Nullable<HotspotStyle> | undefined,
): ParsedAreaStyle {
  return {
    borderColor: style?.borderColor ?? AREA_DEFAULT_BORDER_COLOR,
    borderWidth: style?.borderWidth ?? AREA_DEFAULT_BORDER_WIDTH,
    overlayColor: style?.overlayColor ?? AREA_DEFAULT_OVERLAY_COLOR,
    overlayOpacity: style?.overlayOpacity ?? AREA_DEFAULT_OVERLAY_OPACITY,
    shape: style?.shape ?? AREA_DEFAULT_SHAPE,
  };
}

// ---------------------------------------------------------------------------
// Callout style defaults
// ---------------------------------------------------------------------------

export const CALLOUT_DEFAULT_BG_COLOR = "#1f2937";
export const CALLOUT_DEFAULT_TEXT_COLOR = "#ffffff";
export const CALLOUT_DEFAULT_POINTER: PointerDirection = "bottom";

export interface ParsedCalloutStyle {
  backgroundColor: string;
  textColor: string;
  pointerDirection: PointerDirection;
  showButton: boolean;
  buttonText: string;
}

export function parseCalloutStyle(
  style: Nullable<HotspotStyle> | undefined,
): ParsedCalloutStyle {
  return {
    backgroundColor: style?.backgroundColor ?? CALLOUT_DEFAULT_BG_COLOR,
    textColor: style?.textColor ?? CALLOUT_DEFAULT_TEXT_COLOR,
    pointerDirection: style?.pointerDirection ?? CALLOUT_DEFAULT_POINTER,
    showButton: style?.showButton ?? false,
    buttonText: style?.buttonText ?? "Next",
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
