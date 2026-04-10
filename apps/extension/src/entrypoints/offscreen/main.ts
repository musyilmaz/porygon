import type {
  ExtensionMessage,
  OffscreenStartCaptureResponse,
  OffscreenStopCaptureResponse,
} from "@/types/messages";

let mediaStream: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

function cleanup(): void {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  mediaRecorder = null;

  if (mediaStream) {
    for (const track of mediaStream.getTracks()) {
      track.stop();
    }
  }
  mediaStream = null;
  recordedChunks = [];
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

    // Determine supported mimeType
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

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
        payload: { error: "MediaRecorder error" },
      });
      cleanup();
    });

    // Record in 1-second chunks for more granular data collection
    mediaRecorder.start(1000);

    console.log("[Porygon Offscreen] Capture started, mimeType:", mimeType);
    return { success: true };
  } catch (error) {
    cleanup();
    const message = error instanceof Error ? error.message : "Unknown capture error";
    console.error("[Porygon Offscreen] Failed to start capture:", message);
    return { success: false, error: message };
  }
}

function stopCapture(): Promise<OffscreenStopCaptureResponse> {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      cleanup();
      resolve({ success: true });
      return;
    }

    mediaRecorder.addEventListener("stop", () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const reader = new FileReader();

      reader.onload = () => {
        const videoDataUrl = reader.result as string;
        console.log(
          "[Porygon Offscreen] Capture stopped, blob size:",
          (blob.size / 1024 / 1024).toFixed(2),
          "MB",
        );
        cleanup();
        resolve({ success: true, videoDataUrl });
      };

      reader.onerror = () => {
        console.error("[Porygon Offscreen] Failed to read video blob");
        cleanup();
        resolve({ success: false, error: "Failed to read video blob" });
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
      stopCapture().then(sendResponse);
      return true;
    }
  },
);

console.log("[Porygon Offscreen] Document loaded");
