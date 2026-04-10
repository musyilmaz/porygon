import {
  AuthRequiredError,
  createDemo,
  createHotspot,
  createStep,
  getSessionCookie,
  getUploadUrl,
  getWorkspaces,
  updateStep,
} from "@/lib/api-client";
import type { CapturedStep } from "@/types/recording";
import type { UploadProgress } from "@/types/recording";

const HOTSPOT_SIZE = 40;

let uploadProgress: UploadProgress | null = null;

export function getUploadProgress(): UploadProgress | null {
  return uploadProgress;
}

export function resetUploadProgress(): void {
  uploadProgress = null;
}

function setProgress(update: Partial<UploadProgress>): void {
  if (uploadProgress) {
    uploadProgress = { ...uploadProgress, ...update };
  }
}

async function uploadBlob(url: string, blob: Blob, retries = 3): Promise<void> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      if (response.ok) return;
      throw new Error(`Upload failed: ${response.status}`);
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }
}

export async function sendToApp(
  steps: CapturedStep[],
  tabUrl: string,
): Promise<string> {
  uploadProgress = {
    totalSteps: steps.length,
    completedSteps: 0,
    phase: "creating-demo",
  };

  try {
    // Check auth
    const cookie = await getSessionCookie();
    if (!cookie) {
      throw new AuthRequiredError();
    }

    // Get workspace
    const workspaces = await getWorkspaces();
    if (workspaces.length === 0) {
      throw new Error(
        "No workspace found. Please complete your account setup in the Porygon app.",
      );
    }
    const workspace = workspaces[0]!;

    // Generate title from URL + date
    let hostname = "Demo";
    try {
      hostname = new URL(tabUrl).hostname.replace(/^www\./, "");
    } catch {
      // Use default
    }
    const date = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const title = `${hostname} — ${date}`;

    // Create demo
    const demo = await createDemo({
      title,
      workspaceId: workspace.id,
    });

    uploadProgress = {
      ...uploadProgress!,
      phase: "uploading-steps",
      demoId: demo.id,
    };

    // Upload each step sequentially, collecting IDs for hotspot creation
    const uploadedSteps: Array<{ stepId: string; capturedStep: CapturedStep }> =
      [];

    for (let i = 0; i < steps.length; i++) {
      const capturedStep = steps[i]!;
      const isVideo = capturedStep.mediaType === "video";

      // Create step
      const step = await createStep(demo.id, {
        actionType: capturedStep.actionType,
        actionCoordinates: capturedStep.actionCoordinates,
        ...(isVideo && { mediaType: "video" as const }),
      });

      if (isVideo && capturedStep.videoDataUrl) {
        // Upload video blob
        const { uploadUrl: videoUploadUrl, publicUrl: videoPublicUrl } =
          await getUploadUrl({
            workspaceId: workspace.id,
            demoId: demo.id,
            stepId: step.id,
            contentType: "video/webm",
          });
        const videoBlob = await fetch(capturedStep.videoDataUrl).then((r) =>
          r.blob(),
        );
        await uploadBlob(videoUploadUrl, videoBlob);

        // Upload thumbnail screenshot
        const { uploadUrl: thumbUploadUrl, publicUrl: thumbPublicUrl } =
          await getUploadUrl({
            workspaceId: workspace.id,
            demoId: demo.id,
            stepId: step.id,
            contentType: "image/webp",
          });
        const thumbBlob = await fetch(capturedStep.screenshotDataUrl).then(
          (r) => r.blob(),
        );
        await uploadBlob(thumbUploadUrl, thumbBlob);

        // Patch step with both URLs
        await updateStep(demo.id, step.id, {
          screenshotUrl: thumbPublicUrl,
          videoUrl: videoPublicUrl,
        });
      } else {
        // Image step: existing flow
        const { uploadUrl, publicUrl } = await getUploadUrl({
          workspaceId: workspace.id,
          demoId: demo.id,
          stepId: step.id,
          contentType: "image/webp",
        });
        const blob = await fetch(capturedStep.screenshotDataUrl).then((r) =>
          r.blob(),
        );
        await uploadBlob(uploadUrl, blob);
        await updateStep(demo.id, step.id, { screenshotUrl: publicUrl });
      }

      uploadedSteps.push({ stepId: step.id, capturedStep });
      setProgress({ completedSteps: i + 1 });
    }

    // Create hotspots for click-type steps
    const hotspotPromises = uploadedSteps
      .filter(
        ({ capturedStep }) =>
          capturedStep.actionType === "click" &&
          capturedStep.actionCoordinates !== null,
      )
      .map(({ stepId, capturedStep }) => {
        const coords = capturedStep.actionCoordinates!;
        const currentIndexInAll = uploadedSteps.findIndex(
          (s) => s.stepId === stepId,
        );
        const nextStep = uploadedSteps[currentIndexInAll + 1];

        return createHotspot(stepId, {
          x: Math.max(0, coords.x - HOTSPOT_SIZE / 2),
          y: Math.max(0, coords.y - HOTSPOT_SIZE / 2),
          width: HOTSPOT_SIZE,
          height: HOTSPOT_SIZE,
          targetStepId: nextStep?.stepId ?? null,
          tooltipPosition: "bottom",
          style: { pulseAnimation: true },
        });
      });

    await Promise.all(hotspotPromises);

    uploadProgress = {
      ...uploadProgress!,
      phase: "complete",
      demoId: demo.id,
    };

    return demo.id;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    uploadProgress = {
      ...uploadProgress!,
      phase: "error",
      errorMessage: message,
    };
    throw error;
  }
}
