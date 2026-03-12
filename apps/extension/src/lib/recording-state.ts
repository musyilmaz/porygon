import type { RecordingSession } from "@/types/recording";

export const recordingSession = storage.defineItem<RecordingSession | null>(
  "local:recordingSession",
  { fallback: null },
);
