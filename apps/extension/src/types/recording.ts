import type { ActionType, Coordinates } from "@porygon/shared/types";

export type RecordingStatus = "idle" | "recording" | "paused" | "done" | "uploading";

export interface UploadProgress {
  totalSteps: number;
  completedSteps: number;
  phase: "creating-demo" | "uploading-steps" | "complete" | "error";
  errorMessage?: string;
  demoId?: string;
}

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
  status: RecordingStatus;
}
