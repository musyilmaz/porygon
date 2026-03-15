/** Regex to parse a 6-digit hex color into RGB components */
export const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

/**
 * Converts a hex color string (e.g. "#3b82f6") to an "r, g, b" string
 * suitable for CSS rgba(). Returns null if the hex is invalid.
 */
export function hexToRgb(hex: string): string | null {
  const match = hex.match(HEX_COLOR_REGEX);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  return `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}`;
}
