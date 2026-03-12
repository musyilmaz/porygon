import type { ActionType, Coordinates } from "@repo/shared/types";

export interface CapturedStep {
  orderIndex: number;
  screenshotDataUrl: string;
  actionType: ActionType;
  actionCoordinates: Coordinates | null;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  capturedAt: number;
}

export interface RecordingSession {
  tabId: number;
  tabUrl: string;
  startedAt: number;
}
