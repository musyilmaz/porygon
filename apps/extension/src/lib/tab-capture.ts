import type {
  OffscreenStartCaptureResponse,
  OffscreenStartSegmentResponse,
  OffscreenStopCaptureResponse,
  OffscreenStopSegmentResponse,
} from "@/types/messages";

let capturing = false;

async function ensureOffscreenDocument(): Promise<void> {
  const hasDocument = await chrome.offscreen.hasDocument();
  if (hasDocument) return;

  await chrome.offscreen.createDocument({
    url: browser.runtime.getURL("/offscreen.html"),
    reasons: ["USER_MEDIA"],
    justification: "Tab video capture for demo recording",
  });
}

async function closeOffscreenDocument(): Promise<void> {
  try {
    const hasDocument = await chrome.offscreen.hasDocument();
    if (hasDocument) {
      await chrome.offscreen.closeDocument();
    }
  } catch {
    // Document may already be closed
  }
}

export async function startTabCapture(tabId: number): Promise<boolean> {
  try {
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tabId,
    });

    await ensureOffscreenDocument();

    const response: OffscreenStartCaptureResponse =
      await browser.runtime.sendMessage({
        type: "OFFSCREEN_START_CAPTURE",
        payload: { streamId },
      });

    if (!response.success) {
      console.warn("[Porygon] Offscreen capture failed to start:", response.error);
      await closeOffscreenDocument();
      return false;
    }

    capturing = true;
    console.log("[Porygon] Tab capture started for tab", tabId);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[Porygon] Tab capture unavailable:", message);
    await closeOffscreenDocument();
    return false;
  }
}

export async function stopTabCapture(): Promise<void> {
  if (!capturing) return;

  try {
    const _response: OffscreenStopCaptureResponse =
      await browser.runtime.sendMessage({
        type: "OFFSCREEN_STOP_CAPTURE",
      });

    await closeOffscreenDocument();
    capturing = false;
  } catch (error) {
    console.error("[Porygon] Failed to stop tab capture:", error);
    await closeOffscreenDocument();
    capturing = false;
  }
}

export async function startVideoSegment(): Promise<boolean> {
  if (!capturing) return false;

  try {
    const response: OffscreenStartSegmentResponse =
      await browser.runtime.sendMessage({
        type: "OFFSCREEN_START_SEGMENT",
      });
    return response.success;
  } catch (error) {
    console.warn("[Porygon] Failed to start video segment:", error);
    return false;
  }
}

export async function stopVideoSegment(): Promise<string | null> {
  if (!capturing) return null;

  try {
    const response: OffscreenStopSegmentResponse =
      await browser.runtime.sendMessage({
        type: "OFFSCREEN_STOP_SEGMENT",
      });

    if (response.success && response.videoDataUrl) {
      return response.videoDataUrl;
    }
    return null;
  } catch (error) {
    console.warn("[Porygon] Failed to stop video segment:", error);
    return null;
  }
}

export async function cleanupTabCapture(): Promise<void> {
  capturing = false;
  await closeOffscreenDocument();
}
