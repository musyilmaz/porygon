export const DEMO_STATUSES = ["draft", "published", "archived"] as const;

export const ACTION_TYPES = ["click", "scroll", "type", "navigation"] as const;

export const ANNOTATION_TYPES = ["blur", "crop", "highlight"] as const;

export const TOOLTIP_POSITIONS = ["top", "bottom", "left", "right"] as const;

export const HOTSPOT_TYPES = ["click_zone", "area", "callout"] as const;

export const MEDIA_TYPES = ["image", "video"] as const;

export const POINTER_DIRECTIONS = [
  "top",
  "top-left",
  "top-right",
  "bottom",
  "bottom-left",
  "bottom-right",
  "left",
  "right",
] as const;
