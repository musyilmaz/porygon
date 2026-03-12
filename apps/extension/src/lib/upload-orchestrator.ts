import {
  AuthRequiredError,
  createDemo,
  createStep,
  getSessionCookie,
  getUploadUrl,
  getWorkspaces,
  updateStep,
} from "@/lib/api-client";
import type { CapturedStep } from "@/types/recording";
import type { UploadProgress } from "@/types/recording";

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

    // Upload each step sequentially
    for (let i = 0; i < steps.length; i++) {
      const capturedStep = steps[i]!;

      // Create step
      const step = await createStep(demo.id, {
        actionType: capturedStep.actionType,
        actionCoordinates: capturedStep.actionCoordinates,
      });

      // Get presigned upload URL
      const { uploadUrl, fileUrl } = await getUploadUrl({
        workspaceId: workspace.id,
        demoId: demo.id,
        stepId: step.id,
        contentType: "image/webp",
      });

      // Convert data URL to blob and upload
      const blob = await fetch(capturedStep.screenshotDataUrl).then((r) =>
        r.blob(),
      );
      await uploadBlob(uploadUrl, blob);

      // Patch step with public URL
      await updateStep(demo.id, step.id, { screenshotUrl: fileUrl });

      setProgress({ completedSteps: i + 1 });
    }

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
