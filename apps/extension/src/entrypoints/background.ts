import { getSessionCookie } from "@/lib/api-client";
import { recordingSession } from "@/lib/recording-state";
import { addStep, clearSteps, getStepCount, getSteps } from "@/lib/recording-store";
import {
  getUploadProgress,
  resetUploadProgress,
  sendToApp,
} from "@/lib/upload-orchestrator";
import type {
  ActionCapturedResponse,
  ExtensionMessage,
  GetStepsResponse,
  RecordingStartedResponse,
  RecordingStoppedResponse,
  SendToAppResponse,
  StateResponse,
  StepThumbnail,
  UploadProgressResponse,
} from "@/types/messages";
import type { CapturedStep, RecordingSession } from "@/types/recording";
import { captureScreenshot } from "@/utils/screenshot";

const APP_URL = import.meta.env.WXT_APP_URL;

const CAPTURE_DELAY_MS = 100;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureContentScript(tabId: number): Promise<void> {
  try {
    await browser.tabs.sendMessage(tabId, { type: "PING" });
  } catch {
    // Content script not injected yet (tab was open before extension loaded)
    await browser.scripting.executeScript({
      target: { tabId },
      files: ["/content-scripts/content.js"],
    });
  }
}

async function handleStart(
  tabId: number,
  tabUrl: string,
): Promise<RecordingStartedResponse> {
  clearSteps();

  await ensureContentScript(tabId);

  await recordingSession.setValue({
    tabId,
    tabUrl,
    startedAt: Date.now(),
    status: "recording",
  });

  await browser.tabs.sendMessage(tabId, { type: "RECORDING_STARTED" });

  console.log("[Porygon] Recording started on tab", tabId);
  return { success: true, tabId };
}

async function handleStop(
  tabId: number,
): Promise<RecordingStoppedResponse> {
  await browser.tabs.sendMessage(tabId, { type: "RECORDING_STOPPED" });

  const session = await recordingSession.getValue();
  if (session) {
    await recordingSession.setValue({ ...session, status: "done" });
  }

  const stepCount = getStepCount();
  console.log("[Porygon] Recording stopped.", stepCount, "steps captured");
  return { success: true, stepCount };
}

async function handlePause(
  session: RecordingSession,
): Promise<{ success: boolean }> {
  await browser.tabs.sendMessage(session.tabId, { type: "RECORDING_PAUSED" });
  await recordingSession.setValue({ ...session, status: "paused" });

  console.log("[Porygon] Recording paused");
  return { success: true };
}

async function handleResume(
  session: RecordingSession,
): Promise<{ success: boolean }> {
  await browser.tabs.sendMessage(session.tabId, { type: "RECORDING_RESUMED" });
  await recordingSession.setValue({ ...session, status: "recording" });

  console.log("[Porygon] Recording resumed");
  return { success: true };
}

async function handleGetState(): Promise<StateResponse> {
  const [session, cookie] = await Promise.all([
    recordingSession.getValue(),
    getSessionCookie(),
  ]);
  return {
    status: session?.status ?? "idle",
    stepCount: getStepCount(),
    tabUrl: session?.tabUrl ?? null,
    isAuthenticated: cookie !== null,
  };
}

function handleGetSteps(): GetStepsResponse {
  const steps: StepThumbnail[] = getSteps().map((step) => ({
    orderIndex: step.orderIndex,
    screenshotDataUrl: step.screenshotDataUrl,
    actionType: step.actionType,
    capturedAt: step.capturedAt,
  }));
  return { steps };
}

async function handleNewRecording(): Promise<StateResponse> {
  clearSteps();
  resetUploadProgress();
  const cookie = await getSessionCookie();
  await recordingSession.setValue(null);
  return { status: "idle", stepCount: 0, tabUrl: null, isAuthenticated: cookie !== null };
}

async function handleActionCaptured(
  message: ExtensionMessage & { type: "ACTION_CAPTURED" },
): Promise<ActionCapturedResponse> {
  const session = await recordingSession.getValue();
  if (!session || session.status !== "recording") {
    return { success: false, stepIndex: -1 };
  }

  await delay(CAPTURE_DELAY_MS);

  const screenshotDataUrl = await captureScreenshot();

  const step: CapturedStep = {
    orderIndex: getStepCount(),
    screenshotDataUrl,
    actionType: message.payload.actionType,
    actionCoordinates: message.payload.coordinates,
    scrollY: message.payload.scrollY,
    viewportWidth: message.payload.viewportWidth,
    viewportHeight: message.payload.viewportHeight,
    capturedAt: message.payload.timestamp,
  };

  const stepIndex = addStep(step);
  console.log(
    "[Porygon] Step captured:",
    step.actionType,
    "| Total:",
    stepIndex + 1,
  );

  return { success: true, stepIndex };
}

export default defineBackground(() => {
  console.log("[Porygon] Background service worker started");

  // Re-attach event listeners after the recording tab navigates
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status !== "complete") return;

    recordingSession.getValue().then(async (session) => {
      if (!session || session.tabId !== tabId || session.status !== "recording") {
        return;
      }

      try {
        await ensureContentScript(tabId);
        await browser.tabs.sendMessage(tabId, { type: "RECORDING_STARTED" });
        console.log("[Porygon] Re-attached listeners after navigation on tab", tabId);
      } catch (error) {
        console.error("[Porygon] Failed to re-attach after navigation:", error);
      }
    });
  });

  browser.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse) => {
      if (message.type === "START_RECORDING") {
        const tabId = sender.tab?.id;
        if (!tabId) {
          // Message came from popup, get active tab
          browser.tabs
            .query({ active: true, currentWindow: true })
            .then(([tab]) => {
              if (!tab?.id || !tab.url) {
                sendResponse({ success: false });
                return;
              }
              handleStart(tab.id, tab.url).then(sendResponse);
            });
        } else {
          handleStart(tabId, sender.tab!.url ?? "").then(sendResponse);
        }
        return true;
      }

      if (message.type === "STOP_RECORDING") {
        recordingSession.getValue().then((session: RecordingSession | null) => {
          if (!session) {
            sendResponse({ success: false, stepCount: 0 });
            return;
          }
          handleStop(session.tabId).then(sendResponse);
        });
        return true;
      }

      if (message.type === "PAUSE_RECORDING") {
        recordingSession.getValue().then((session: RecordingSession | null) => {
          if (!session || session.status !== "recording") {
            sendResponse({ success: false });
            return;
          }
          handlePause(session).then(sendResponse);
        });
        return true;
      }

      if (message.type === "RESUME_RECORDING") {
        recordingSession.getValue().then((session: RecordingSession | null) => {
          if (!session || session.status !== "paused") {
            sendResponse({ success: false });
            return;
          }
          handleResume(session).then(sendResponse);
        });
        return true;
      }

      if (message.type === "GET_STATE") {
        handleGetState().then(sendResponse);
        return true;
      }

      if (message.type === "GET_STEPS") {
        sendResponse(handleGetSteps());
        return false;
      }

      if (message.type === "NEW_RECORDING") {
        handleNewRecording().then(sendResponse);
        return true;
      }

      if (message.type === "SEND_TO_APP") {
        const steps = getSteps();
        if (steps.length === 0) {
          sendResponse({ success: false, error: "No steps to upload" } satisfies SendToAppResponse);
          return false;
        }

        recordingSession.getValue().then(async (session) => {
          const tabUrl = session?.tabUrl ?? "";
          if (session) {
            await recordingSession.setValue({ ...session, status: "uploading" });
          }

          sendResponse({ success: true } satisfies SendToAppResponse);

          try {
            const demoId = await sendToApp(steps, tabUrl);
            await browser.tabs.create({
              url: `${APP_URL}/editor/${demoId}?new=true`,
            });
            clearSteps();
            await recordingSession.setValue(null);
            resetUploadProgress();
          } catch (error) {
            console.error("[Porygon] Upload failed:", error);
            // Progress object retains error details for the popup to read
          }
        });
        return true;
      }

      if (message.type === "GET_UPLOAD_PROGRESS") {
        sendResponse({ progress: getUploadProgress() } satisfies UploadProgressResponse);
        return false;
      }

      if (message.type === "ACTION_CAPTURED") {
        handleActionCaptured(message).then(sendResponse).catch((error) => {
          console.error("[Porygon] Failed to capture step:", error);
          sendResponse({ success: false, stepIndex: -1 });
        });
        return true;
      }
    },
  );
});
