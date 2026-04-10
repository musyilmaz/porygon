export type TooltipPosition = "top" | "bottom" | "left" | "right";

export type HotspotType = "click_zone" | "area" | "callout";

export type PointerDirection =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

export interface HotspotStyle {
  borderColor?: string;
  borderWidth?: number;
  backgroundColor?: string;
  opacity?: number;
  pulseAnimation?: boolean;
  // Area-specific
  overlayColor?: string;
  overlayOpacity?: number;
  shape?: "rectangle" | "rounded";
  // Callout-specific
  pointerDirection?: PointerDirection;
  showButton?: boolean;
  buttonText?: string;
}

export interface Hotspot {
  id: string;
  stepId: string;
  type: HotspotType;
  x: number;
  y: number;
  width: number;
  height: number;
  targetStepId: string | null;
  tooltipContent: Record<string, unknown> | null;
  tooltipPosition: TooltipPosition;
  style: HotspotStyle;
  openByDefault: boolean;
}
