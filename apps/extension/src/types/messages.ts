import type { ActionType, Coordinates } from "@repo/shared/types";

// Popup → Background
export interface StartRecordingMessage {
  type: "START_RECORDING";
}

export interface StopRecordingMessage {
  type: "STOP_RECORDING";
}

export interface GetStateMessage {
  type: "GET_STATE";
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

export interface PingMessage {
  type: "PING";
}

export type ExtensionMessage =
  | StartRecordingMessage
  | StopRecordingMessage
  | GetStateMessage
  | ActionCapturedMessage
  | RecordingStartedMessage
  | RecordingStoppedMessage
  | PingMessage;

// Response types
export interface StateResponse {
  isRecording: boolean;
  stepCount: number;
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
