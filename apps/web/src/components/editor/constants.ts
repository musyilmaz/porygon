/** Default RGB for hotspots that branch to another step (green-500) */
export const HOTSPOT_BRANCHING_RGB = "34, 197, 94";

/** Default RGB for standard hotspots (blue-500) */
export const HOTSPOT_DEFAULT_RGB = "59, 130, 246";

/** Default hex color shown in the style picker (blue-500) */
export const HOTSPOT_DEFAULT_COLOR = "#3b82f6";

/** Default fill opacity for hotspot overlays */
export const HOTSPOT_DEFAULT_OPACITY = 0.3;

/** Regex to parse a 6-digit hex color into RGB components */
export const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

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
