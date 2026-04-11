import type { ActionType } from "@porygon/shared/types";

import { getSessionCookie } from "@/lib/api-client";
import { recordingSession } from "@/lib/recording-state";
import { addStep, clearSteps, getStepCount, getSteps } from "@/lib/recording-store";
import {
  cleanupTabCapture,
  startTabCapture,
  startVideoSegment,
  stopTabCapture,
  stopVideoSegment,
} from "@/lib/tab-capture";
import {
  getUploadProgress,
  resetUploadProgress,
  sendToApp,
} from "@/lib/upload-orchestrator";
import type {
  ActionCapturedResponse,
  ContinuousActionEndMessage,
  ContinuousActionStartMessage,
  ExtensionMessage,
  GetStepsResponse,
  GetViewportResponse,
  NavigationDetectedMessage,
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
const MAX_SEGMENT_DURATION_MS = 15_000;
const NAVIGATION_SETTLE_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Navigation capture state
let navigationSettleTimer: ReturnType<typeof setTimeout> | null = null;
let lastNavigationUrl: string | null = null;
let lastNavigationTimestamp = 0;

// Active video segment state
let activeSegment: {
  actionType: ActionType;
  startedAt: number;
  maxDurationTimer: ReturnType<typeof setTimeout>;
} | null = null;

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

async function finalizeSegment(endPayload?: {
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
}): Promise<void> {
  if (!activeSegment) return;

  const segmentActionType = activeSegment.actionType;
  clearTimeout(activeSegment.maxDurationTimer);
  activeSegment = null;

  const videoDataUrl = await stopVideoSegment();

  const screenshotDataUrl = await captureScreenshot();

  const step: CapturedStep = {
    orderIndex: getStepCount(),
    screenshotDataUrl,
    actionType: segmentActionType,
    actionCoordinates: null,
    scrollY: endPayload?.scrollY ?? 0,
    viewportWidth: endPayload?.viewportWidth ?? 0,
    viewportHeight: endPayload?.viewportHeight ?? 0,
    capturedAt: Date.now(),
    mediaType: videoDataUrl ? "video" : "image",
    videoDataUrl: videoDataUrl ?? undefined,
  };

  const stepIndex = addStep(step);
  console.log(
    "[Porygon] Video segment captured:",
    segmentActionType,
    videoDataUrl
      ? `(${(videoDataUrl.length / 1024 / 1024).toFixed(2)} MB)`
      : "(no video, screenshot fallback)",
    "| Total:",
    stepIndex + 1,
  );
}

async function handleSegmentMaxDuration(): Promise<void> {
  if (!activeSegment) return;

  const actionType = activeSegment.actionType;
  console.log("[Porygon] Segment hit 15s cap, auto-splitting:", actionType);

  await finalizeSegment();

  const session = await recordingSession.getValue();
  if (!session || session.status !== "recording" || !session.videoCaptureActive) {
    return;
  }

  const started = await startVideoSegment();
  if (!started) return;

  activeSegment = {
    actionType,
    startedAt: Date.now(),
    maxDurationTimer: setTimeout(() => {
      handleSegmentMaxDuration();
    }, MAX_SEGMENT_DURATION_MS),
  };
}

function cancelPendingNavigationCapture(): void {
  if (navigationSettleTimer) {
    clearTimeout(navigationSettleTimer);
    navigationSettleTimer = null;
  }
}

function scheduleNavigationCapture(
  tabId: number,
  url: string,
  viewportData?: { scrollY: number; viewportWidth: number; viewportHeight: number },
): void {
  // Dedup: skip if same URL as last navigation capture
  if (url === lastNavigationUrl) return;

  // Debounce: clear any pending timer (handles rapid redirects)
  cancelPendingNavigationCapture();

  lastNavigationUrl = url;
  lastNavigationTimestamp = Date.now();

  navigationSettleTimer = setTimeout(async () => {
    navigationSettleTimer = null;

    const session = await recordingSession.getValue();
    if (!session || session.tabId !== tabId || session.status !== "recording") {
      return;
    }

    // For full-page nav without viewport data, query the content script
    let viewport = viewportData;
    if (!viewport) {
      try {
        viewport = await browser.tabs.sendMessage(tabId, {
          type: "GET_VIEWPORT",
        }) as GetViewportResponse;
      } catch {
        viewport = { scrollY: 0, viewportWidth: 0, viewportHeight: 0 };
      }
    }

    try {
      const screenshotDataUrl = await captureScreenshot();

      const step: CapturedStep = {
        orderIndex: getStepCount(),
        screenshotDataUrl,
        actionType: "navigation",
        actionCoordinates: null,
        scrollY: viewport.scrollY,
        viewportWidth: viewport.viewportWidth,
        viewportHeight: viewport.viewportHeight,
        capturedAt: Date.now(),
      };

      const stepIndex = addStep(step);
      console.log("[Porygon] Navigation step captured:", url, "| Total:", stepIndex + 1);
    } catch (error) {
      console.error("[Porygon] Failed to capture navigation step:", error);
    }
  }, NAVIGATION_SETTLE_MS);
}

async function handleFullPageNavigation(tabId: number, url?: string): Promise<void> {
  const session = await recordingSession.getValue();
  if (!session || session.tabId !== tabId || session.status !== "recording") {
    return;
  }

  // Finalize any active video segment
  if (activeSegment) {
    await finalizeSegment();
  }

  try {
    await ensureContentScript(tabId);
    await browser.tabs.sendMessage(tabId, { type: "RECORDING_STARTED" });
    console.log("[Porygon] Re-attached listeners after navigation on tab", tabId);
  } catch (error) {
    console.error("[Porygon] Failed to re-attach after navigation:", error);
    return;
  }

  // Schedule the navigation screenshot capture
  if (url) {
    scheduleNavigationCapture(tabId, url);
  }
}

async function handleNavigationDetected(
  message: NavigationDetectedMessage,
): Promise<void> {
  const session = await recordingSession.getValue();
  if (!session || session.status !== "recording") return;

  scheduleNavigationCapture(session.tabId, message.payload.url, {
    scrollY: message.payload.scrollY,
    viewportWidth: message.payload.viewportWidth,
    viewportHeight: message.payload.viewportHeight,
  });
}

async function handleContinuousActionStart(
  message: ContinuousActionStartMessage,
): Promise<void> {
  const session = await recordingSession.getValue();
  if (!session || session.status !== "recording") {
    return;
  }

  if (!session.videoCaptureActive) {
    // No video capture — will fall back to screenshot on CONTINUOUS_ACTION_END
    return;
  }

  if (activeSegment) {
    // Segment already active, ignore (debounce merges rapid events)
    return;
  }

  const started = await startVideoSegment();
  if (!started) {
    console.warn("[Porygon] Failed to start video segment, will fall back to screenshot");
    return;
  }

  activeSegment = {
    actionType: message.payload.actionType,
    startedAt: message.payload.timestamp,
    maxDurationTimer: setTimeout(() => {
      handleSegmentMaxDuration();
    }, MAX_SEGMENT_DURATION_MS),
  };

  console.log("[Porygon] Video segment started:", message.payload.actionType);
}

async function handleContinuousActionEnd(
  message: ContinuousActionEndMessage,
): Promise<void> {
  if (activeSegment) {
    await finalizeSegment({
      scrollY: message.payload.scrollY,
      viewportWidth: message.payload.viewportWidth,
      viewportHeight: message.payload.viewportHeight,
    });
    return;
  }

  // Fallback: video capture was unavailable or segment failed to start — capture screenshot
  const session = await recordingSession.getValue();
  if (!session || session.status !== "recording") {
    return;
  }

  await delay(CAPTURE_DELAY_MS);
  const screenshotDataUrl = await captureScreenshot();

  const step: CapturedStep = {
    orderIndex: getStepCount(),
    screenshotDataUrl,
    actionType: message.payload.actionType,
    actionCoordinates: null,
    scrollY: message.payload.scrollY,
    viewportWidth: message.payload.viewportWidth,
    viewportHeight: message.payload.viewportHeight,
    capturedAt: message.payload.timestamp,
  };

  const stepIndex = addStep(step);
  console.log(
    "[Porygon] Step captured (screenshot fallback):",
    step.actionType,
    "| Total:",
    stepIndex + 1,
  );
}

async function handleStart(
  tabId: number,
  tabUrl: string,
): Promise<RecordingStartedResponse> {
  lastNavigationUrl = null;
  clearSteps();

  await ensureContentScript(tabId);

  // Attempt tab video capture (non-blocking on failure)
  const videoCaptureActive = await startTabCapture(tabId);
  if (!videoCaptureActive) {
    console.warn("[Porygon] Tab capture unavailable, continuing screenshot-only");
  }

  await recordingSession.setValue({
    tabId,
    tabUrl,
    startedAt: Date.now(),
    status: "recording",
    videoCaptureActive,
  });

  await browser.tabs.sendMessage(tabId, { type: "RECORDING_STARTED" });

  console.log(
    "[Porygon] Recording started on tab",
    tabId,
    videoCaptureActive ? "(with video)" : "(screenshot-only)",
  );
  return { success: true, tabId };
}

async function handleStop(
  tabId: number,
): Promise<RecordingStoppedResponse> {
  cancelPendingNavigationCapture();
  await browser.tabs.sendMessage(tabId, { type: "RECORDING_STOPPED" });

  // Finalize any active video segment before teardown
  if (activeSegment) {
    await finalizeSegment();
  }

  const session = await recordingSession.getValue();

  if (session?.videoCaptureActive) {
    await stopTabCapture();
    console.log("[Porygon] Video capture stopped");
  }

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
  cancelPendingNavigationCapture();

  // Finalize any active video segment before pausing
  if (activeSegment) {
    await finalizeSegment();
  }

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
  cancelPendingNavigationCapture();
  lastNavigationUrl = null;

  if (activeSegment) {
    clearTimeout(activeSegment.maxDurationTimer);
    activeSegment = null;
  }

  clearSteps();
  resetUploadProgress();
  await cleanupTabCapture();
  const cookie = await getSessionCookie();
  await recordingSession.setValue(null);
  return { status: "idle", stepCount: 0, tabUrl: null, isAuthenticated: cookie !== null };
}

async function handleActionCaptured(
  message: ExtensionMessage & { type: "ACTION_CAPTURED" },
): Promise<ActionCapturedResponse> {
  // Cancel any pending navigation capture — the click supersedes it
  cancelPendingNavigationCapture();

  const session = await recordingSession.getValue();
  if (!session || session.status !== "recording") {
    return { success: false, stepIndex: -1 };
  }

  // If a video segment is active, finalize it before processing the click
  if (activeSegment) {
    await finalizeSegment();
    await delay(50);
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

  // Primary: detect full-page navigation via webNavigation API
  browser.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId !== 0) return;
    handleFullPageNavigation(details.tabId, details.url);
  });

  // Fallback: re-inject content script via tabs.onUpdated if webNavigation missed it
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;

    recordingSession.getValue().then(async (session) => {
      if (!session || session.tabId !== tabId || session.status !== "recording") {
        return;
      }

      // If webNavigation already handled this recently, just ensure content script
      if (tab.url && tab.url === lastNavigationUrl && Date.now() - lastNavigationTimestamp < 2000) {
        try {
          await ensureContentScript(tabId);
        } catch {
          // ignore
        }
        return;
      }

      handleFullPageNavigation(tabId, tab.url);
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

      if (message.type === "OFFSCREEN_CAPTURE_FAILED") {
        console.warn("[Porygon] Video capture failed:", message.payload.error);
        recordingSession.getValue().then(async (session) => {
          if (session) {
            await recordingSession.setValue({ ...session, videoCaptureActive: false });
          }
          await cleanupTabCapture();
        });

        // Clear active segment since capture is no longer available
        if (activeSegment) {
          clearTimeout(activeSegment.maxDurationTimer);
          activeSegment = null;
        }

        return false;
      }

      if (message.type === "NAVIGATION_DETECTED") {
        handleNavigationDetected(message);
        return false;
      }

      if (message.type === "CONTINUOUS_ACTION_START") {
        handleContinuousActionStart(message);
        return false;
      }

      if (message.type === "CONTINUOUS_ACTION_END") {
        handleContinuousActionEnd(message);
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
