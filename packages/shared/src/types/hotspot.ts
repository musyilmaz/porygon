export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface HotspotStyle {
  borderColor?: string;
  borderWidth?: number;
  backgroundColor?: string;
  opacity?: number;
  pulseAnimation?: boolean;
}

export interface Hotspot {
  id: string;
  stepId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetStepId: string | null;
  tooltipContent: Record<string, unknown> | null;
  tooltipPosition: TooltipPosition;
  style: HotspotStyle;
}
