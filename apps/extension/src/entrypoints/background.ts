import { recordingSession } from "@/lib/recording-state";
import { addStep, clearSteps, getStepCount } from "@/lib/recording-store";
import type {
  ActionCapturedResponse,
  ExtensionMessage,
  RecordingStartedResponse,
  RecordingStoppedResponse,
  StateResponse,
} from "@/types/messages";
import type { CapturedStep, RecordingSession } from "@/types/recording";
import { captureScreenshot } from "@/utils/screenshot";

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
  });

  await browser.tabs.sendMessage(tabId, { type: "RECORDING_STARTED" });

  console.log("[Porygon] Recording started on tab", tabId);
  return { success: true, tabId };
}

async function handleStop(
  tabId: number,
): Promise<RecordingStoppedResponse> {
  await browser.tabs.sendMessage(tabId, { type: "RECORDING_STOPPED" });
  await recordingSession.setValue(null);

  const stepCount = getStepCount();
  console.log("[Porygon] Recording stopped.", stepCount, "steps captured");
  return { success: true, stepCount };
}

async function handleGetState(): Promise<StateResponse> {
  const session = await recordingSession.getValue();
  return {
    isRecording: session !== null,
    stepCount: getStepCount(),
  };
}

async function handleActionCaptured(
  message: ExtensionMessage & { type: "ACTION_CAPTURED" },
): Promise<ActionCapturedResponse> {
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

      if (message.type === "GET_STATE") {
        handleGetState().then(sendResponse);
        return true;
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
