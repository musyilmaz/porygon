/** Matches a valid 6-digit hex color code (e.g., #ff00ab, #1A2B3C) */
export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Matches a valid slug: lowercase alphanumeric segments separated by single hyphens (e.g., "my-workspace") */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
