import type {
  ExtensionMessage,
  OffscreenStartCaptureResponse,
  OffscreenStartSegmentResponse,
  OffscreenStopCaptureResponse,
  OffscreenStopSegmentResponse,
} from "@/types/messages";

let mediaStream: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

function getSupportedMimeType(): string {
  return MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
}

function stopRecorder(): void {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  mediaRecorder = null;
  recordedChunks = [];
}

function cleanup(): void {
  stopRecorder();

  if (mediaStream) {
    for (const track of mediaStream.getTracks()) {
      track.stop();
    }
  }
  mediaStream = null;
}

async function startCapture(streamId: string): Promise<OffscreenStartCaptureResponse> {
  try {
    cleanup();

    // Chrome-specific constraints for tab capture (not in standard MediaStreamConstraints type)
    const constraints = {
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      },
    } as MediaStreamConstraints;

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

    // Mute captured audio locally so it doesn't echo
    const audioTracks = mediaStream.getAudioTracks();
    for (const track of audioTracks) {
      track.enabled = false;
    }

    // Notify background if the stream ends unexpectedly
    const videoTrack = mediaStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.addEventListener("ended", () => {
        browser.runtime.sendMessage({
          type: "OFFSCREEN_CAPTURE_FAILED",
          payload: { error: "Video track ended unexpectedly" },
        });
        cleanup();
      });
    }

    console.log("[Porygon Offscreen] Stream acquired, ready for segments");
    return { success: true };
  } catch (error) {
    cleanup();
    const message = error instanceof Error ? error.message : "Unknown capture error";
    console.error("[Porygon Offscreen] Failed to acquire stream:", message);
    return { success: false, error: message };
  }
}

function stopCapture(): OffscreenStopCaptureResponse {
  stopRecorder();
  cleanup();
  console.log("[Porygon Offscreen] Stream released");
  return { success: true };
}

function startSegment(): OffscreenStartSegmentResponse {
  if (!mediaStream) {
    return { success: false, error: "No active stream" };
  }

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    return { success: false, error: "Segment already recording" };
  }

  const mimeType = getSupportedMimeType();

  mediaRecorder = new MediaRecorder(mediaStream, {
    mimeType,
    videoBitsPerSecond: 2_500_000,
  });

  recordedChunks = [];

  mediaRecorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  });

  mediaRecorder.addEventListener("error", () => {
    browser.runtime.sendMessage({
      type: "OFFSCREEN_CAPTURE_FAILED",
      payload: { error: "MediaRecorder error during segment" },
    });
    stopRecorder();
  });

  // Record in 1-second chunks for more granular data collection
  mediaRecorder.start(1000);

  console.log("[Porygon Offscreen] Segment started, mimeType:", mimeType);
  return { success: true };
}

function stopSegment(): Promise<OffscreenStopSegmentResponse> {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      recordedChunks = [];
      resolve({ success: true });
      return;
    }

    mediaRecorder.addEventListener("stop", () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      recordedChunks = [];
      mediaRecorder = null;

      const reader = new FileReader();

      reader.onload = () => {
        const videoDataUrl = reader.result as string;
        console.log(
          "[Porygon Offscreen] Segment stopped, blob size:",
          (blob.size / 1024 / 1024).toFixed(2),
          "MB",
        );
        resolve({ success: true, videoDataUrl });
      };

      reader.onerror = () => {
        console.error("[Porygon Offscreen] Failed to read segment blob");
        resolve({ success: false, error: "Failed to read segment blob" });
      };

      reader.readAsDataURL(blob);
    }, { once: true });

    mediaRecorder.stop();
  });
}

browser.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === "OFFSCREEN_START_CAPTURE") {
      startCapture(message.payload.streamId).then(sendResponse);
      return true;
    }

    if (message.type === "OFFSCREEN_STOP_CAPTURE") {
      sendResponse(stopCapture());
      return false;
    }

    if (message.type === "OFFSCREEN_START_SEGMENT") {
      sendResponse(startSegment());
      return false;
    }

    if (message.type === "OFFSCREEN_STOP_SEGMENT") {
      stopSegment().then(sendResponse);
      return true;
    }
  },
);

console.log("[Porygon Offscreen] Document loaded");
