import type { ActionType, Coordinates } from "@porygon/shared/types";

import type { RecordingStatus, UploadProgress } from "./recording";

// Popup → Background
export interface StartRecordingMessage {
  type: "START_RECORDING";
}

export interface StopRecordingMessage {
  type: "STOP_RECORDING";
}

export interface PauseRecordingMessage {
  type: "PAUSE_RECORDING";
}

export interface ResumeRecordingMessage {
  type: "RESUME_RECORDING";
}

export interface GetStateMessage {
  type: "GET_STATE";
}

export interface GetStepsMessage {
  type: "GET_STEPS";
}

export interface NewRecordingMessage {
  type: "NEW_RECORDING";
}

export interface SendToAppMessage {
  type: "SEND_TO_APP";
}

export interface GetUploadProgressMessage {
  type: "GET_UPLOAD_PROGRESS";
}

// Content → Background
export interface ActionCapturedMessage {
  type: "ACTION_CAPTURED";
  payload: {
    actionType: ActionType;
    coordinates: Coordinates | null;
    timestamp: number;
    scrollY: number;
    viewportWidth: number;
    viewportHeight: number;
  };
}

export interface ContinuousActionStartMessage {
  type: "CONTINUOUS_ACTION_START";
  payload: {
    actionType: ActionType;
    timestamp: number;
  };
}

export interface ContinuousActionEndMessage {
  type: "CONTINUOUS_ACTION_END";
  payload: {
    actionType: ActionType;
    timestamp: number;
    scrollY: number;
    viewportWidth: number;
    viewportHeight: number;
  };
}

// Background → Offscreen
export interface OffscreenStartCaptureMessage {
  type: "OFFSCREEN_START_CAPTURE";
  payload: { streamId: string };
}

export interface OffscreenStopCaptureMessage {
  type: "OFFSCREEN_STOP_CAPTURE";
}

// Background → Offscreen (segment control)
export interface OffscreenStartSegmentMessage {
  type: "OFFSCREEN_START_SEGMENT";
}

export interface OffscreenStopSegmentMessage {
  type: "OFFSCREEN_STOP_SEGMENT";
}

// Offscreen → Background
export interface OffscreenCaptureFailedMessage {
  type: "OFFSCREEN_CAPTURE_FAILED";
  payload: { error: string };
}

// Background → Content
export interface RecordingStartedMessage {
  type: "RECORDING_STARTED";
}

export interface RecordingStoppedMessage {
  type: "RECORDING_STOPPED";
}

export interface RecordingPausedMessage {
  type: "RECORDING_PAUSED";
}

export interface RecordingResumedMessage {
  type: "RECORDING_RESUMED";
}

export interface PingMessage {
  type: "PING";
}

export type ExtensionMessage =
  | StartRecordingMessage
  | StopRecordingMessage
  | PauseRecordingMessage
  | ResumeRecordingMessage
  | GetStateMessage
  | GetStepsMessage
  | NewRecordingMessage
  | SendToAppMessage
  | GetUploadProgressMessage
  | ActionCapturedMessage
  | ContinuousActionStartMessage
  | ContinuousActionEndMessage
  | RecordingStartedMessage
  | RecordingStoppedMessage
  | RecordingPausedMessage
  | RecordingResumedMessage
  | PingMessage
  | OffscreenStartCaptureMessage
  | OffscreenStopCaptureMessage
  | OffscreenStartSegmentMessage
  | OffscreenStopSegmentMessage
  | OffscreenCaptureFailedMessage;

// Response types
export interface StateResponse {
  status: RecordingStatus;
  stepCount: number;
  tabUrl: string | null;
  isAuthenticated: boolean;
}

export interface StepThumbnail {
  orderIndex: number;
  screenshotDataUrl: string;
  actionType: ActionType;
  capturedAt: number;
}

export interface GetStepsResponse {
  steps: StepThumbnail[];
}

export interface RecordingStartedResponse {
  success: boolean;
  tabId: number;
}

export interface RecordingStoppedResponse {
  success: boolean;
  stepCount: number;
}

export interface ActionCapturedResponse {
  success: boolean;
  stepIndex: number;
}

export interface SendToAppResponse {
  success: boolean;
  error?: string;
}

export interface UploadProgressResponse {
  progress: UploadProgress | null;
}

export interface OffscreenStartCaptureResponse {
  success: boolean;
  error?: string;
}

export interface OffscreenStopCaptureResponse {
  success: boolean;
  error?: string;
}

export interface OffscreenStartSegmentResponse {
  success: boolean;
  error?: string;
}

export interface OffscreenStopSegmentResponse {
  success: boolean;
  videoDataUrl?: string;
  error?: string;
}
