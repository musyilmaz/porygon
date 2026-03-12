import type { ActionType, Coordinates } from "@porygon/shared/types";

import type { RecordingStatus } from "./recording";

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
  | ActionCapturedMessage
  | RecordingStartedMessage
  | RecordingStoppedMessage
  | RecordingPausedMessage
  | RecordingResumedMessage
  | PingMessage;

// Response types
export interface StateResponse {
  status: RecordingStatus;
  stepCount: number;
  tabUrl: string | null;
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
