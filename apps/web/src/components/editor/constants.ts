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

/**
 * Extracts typed style values from the untyped jsonb `Record<string, unknown>`.
 * Returns defaults for any missing or invalid fields.
 */
export function parseHotspotStyle(
  style: Record<string, unknown> | null | undefined,
): ParsedHotspotStyle {
  return {
    backgroundColor:
      typeof style?.backgroundColor === "string"
        ? style.backgroundColor
        : HOTSPOT_DEFAULT_COLOR,
    opacity:
      typeof style?.opacity === "number"
        ? style.opacity
        : HOTSPOT_DEFAULT_OPACITY,
    pulseAnimation:
      typeof style?.pulseAnimation === "boolean"
        ? style.pulseAnimation
        : false,
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
  settings: Record<string, unknown> | null | undefined,
): ParsedBlurSettings {
  return {
    blurIntensity:
      typeof settings?.blurIntensity === "number"
        ? settings.blurIntensity
        : ANNOTATION_DEFAULT_BLUR_INTENSITY,
  };
}

export function parseHighlightSettings(
  settings: Record<string, unknown> | null | undefined,
): ParsedHighlightSettings {
  return {
    highlightColor:
      typeof settings?.highlightColor === "string"
        ? settings.highlightColor
        : ANNOTATION_DEFAULT_HIGHLIGHT_COLOR,
    highlightOpacity:
      typeof settings?.highlightOpacity === "number"
        ? settings.highlightOpacity
        : ANNOTATION_DEFAULT_HIGHLIGHT_OPACITY,
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
  settings: Record<string, unknown> | null | undefined,
): ParsedCropSettings {
  return {
    lockAspectRatio:
      typeof settings?.lockAspectRatio === "boolean"
        ? settings.lockAspectRatio
        : true,
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
