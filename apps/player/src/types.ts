import type {
  ActionType,
  AnnotationSettings,
  AnnotationType,
  Coordinates,
  DemoSettings,
  HotspotStyle,
  Nullable,
  TooltipPosition,
} from "@porygon/shared";

export interface PlayerHotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetStepId: Nullable<string>;
  tooltipContent: Nullable<Record<string, unknown>>;
  tooltipPosition: TooltipPosition;
  style: HotspotStyle;
}

export interface PlayerAnnotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  width: number;
  height: number;
  settings: AnnotationSettings;
}

export interface PlayerStep {
  id: string;
  orderIndex: number;
  screenshotUrl: string;
  actionType: ActionType;
  actionCoordinates: Nullable<Coordinates>;
  hotspots: PlayerHotspot[];
  annotations: PlayerAnnotation[];
}

export interface PlayerConfig {
  id: string;
  title: string;
  description: Nullable<string>;
  slug: string;
  settings: DemoSettings;
  steps: PlayerStep[];
}

export interface PlayerState {
  readonly currentStepIndex: number;
  readonly currentStep: PlayerStep;
  readonly totalSteps: number;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly isComplete: boolean;
  readonly canGoNext: boolean;
  readonly canGoPrevious: boolean;
}

export interface PlayerEventMap {
  stepChange: { fromIndex: number; toIndex: number; step: PlayerStep };
  complete: { totalSteps: number };
  branchSelect: { hotspotId: string; fromIndex: number; toIndex: number };
}

export type PlayerEventType = keyof PlayerEventMap;

export type PlayerEventHandler<T extends PlayerEventType> = (
  payload: PlayerEventMap[T],
) => void;
