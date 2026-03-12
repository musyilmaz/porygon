import { Badge } from "@porygon/ui/components/badge";
import { Button } from "@porygon/ui/components/button";
import {
  CheckCircle,
  Circle,
  ExternalLink,
  Pause,
  Play,
  Square,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  GetStepsResponse,
  StateResponse,
  StepThumbnail,
} from "@/types/messages";
import type { RecordingStatus } from "@/types/recording";

const WEB_APP_URL = "https://app.porygon.dev/dashboard";
const POLL_INTERVAL_MS = 2000;

export function App() {
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [stepCount, setStepCount] = useState(0);
  const [steps, setSteps] = useState<StepThumbnail[]>([]);
  const [tabUrl, setTabUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSteps = useCallback(async () => {
    try {
      const response: GetStepsResponse = await browser.runtime.sendMessage({
        type: "GET_STEPS",
      });
      setSteps(response.steps);
    } catch {
      // Non-critical, don't set error
    }
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const response: StateResponse = await browser.runtime.sendMessage({
        type: "GET_STATE",
      });
      setStatus(response.status);
      setStepCount(response.stepCount);
      setTabUrl(response.tabUrl);
    } catch {
      setError("Failed to get state");
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchState()
      .then(() => fetchSteps())
      .finally(() => setIsLoading(false));
  }, [fetchState, fetchSteps]);

  // Polling during recording
  useEffect(() => {
    if (status === "recording") {
      pollRef.current = setInterval(async () => {
        await fetchState();
        await fetchSteps();
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [status, fetchState, fetchSteps]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await browser.runtime.sendMessage({ type: "START_RECORDING" });
      setStatus("recording");
      setStepCount(0);
      setSteps([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStop = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await browser.runtime.sendMessage({
        type: "STOP_RECORDING",
      });
      setStatus("done");
      setStepCount(response.stepCount);
      await fetchSteps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop");
    } finally {
      setIsLoading(false);
    }
  }, [fetchSteps]);

  const handlePause = useCallback(async () => {
    setError(null);
    try {
      await browser.runtime.sendMessage({ type: "PAUSE_RECORDING" });
      setStatus("paused");
      await fetchSteps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pause");
    }
  }, [fetchSteps]);

  const handleResume = useCallback(async () => {
    setError(null);
    try {
      await browser.runtime.sendMessage({ type: "RESUME_RECORDING" });
      setStatus("recording");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resume");
    }
  }, []);

  const handleNewRecording = useCallback(async () => {
    setError(null);
    try {
      await browser.runtime.sendMessage({ type: "NEW_RECORDING" });
      setStatus("idle");
      setStepCount(0);
      setSteps([]);
      setTabUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset");
    }
  }, []);

  const handleEditInApp = useCallback(() => {
    window.open(WEB_APP_URL, "_blank");
  }, []);

  if (isLoading && status === "idle" && stepCount === 0) {
    return (
      <div className="flex h-[400px] w-[360px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[400px] w-[360px] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">Porygon</span>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col">
        {status === "idle" && <IdleView onStart={handleStart} isLoading={isLoading} />}

        {(status === "recording" || status === "paused") && (
          <ActiveView
            status={status}
            stepCount={stepCount}
            steps={steps}
            tabUrl={tabUrl}
            isLoading={isLoading}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
          />
        )}

        {status === "done" && (
          <DoneView
            stepCount={stepCount}
            steps={steps}
            onEditInApp={handleEditInApp}
            onNewRecording={handleNewRecording}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border-t px-4 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RecordingStatus }) {
  if (status === "idle") return null;

  if (status === "recording") {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <Circle className="recording-pulse size-2 fill-current" />
        Recording
      </Badge>
    );
  }

  if (status === "paused") {
    return (
      <Badge variant="secondary" className="gap-1.5 bg-amber-100 text-amber-800">
        <Pause className="size-2.5 fill-current" />
        Paused
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1.5 bg-green-100 text-green-800">
      <CheckCircle className="size-2.5" />
      Done
    </Badge>
  );
}

function IdleView({
  onStart,
  isLoading,
}: {
  onStart: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Capture a Demo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Click start and interact with the page to record your demo steps.
        </p>
      </div>
      <Button onClick={onStart} disabled={isLoading} className="w-full">
        <Play className="size-4" />
        Start Recording
      </Button>
    </div>
  );
}

function ActiveView({
  status,
  stepCount,
  steps,
  tabUrl,
  isLoading,
  onPause,
  onResume,
  onStop,
}: {
  status: "recording" | "paused";
  stepCount: number;
  steps: StepThumbnail[];
  tabUrl: string | null;
  isLoading: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Info bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm text-muted-foreground">
          {stepCount} step{stepCount !== 1 ? "s" : ""} captured
        </span>
        {tabUrl && (
          <span className="max-w-[160px] truncate text-xs text-muted-foreground">
            {new URL(tabUrl).hostname}
          </span>
        )}
      </div>

      {/* Step thumbnails */}
      <StepList steps={steps} />

      {/* Actions */}
      <div className="flex gap-2 border-t px-4 py-3">
        {status === "recording" ? (
          <Button variant="secondary" onClick={onPause} className="flex-1" disabled={isLoading}>
            <Pause className="size-4" />
            Pause
          </Button>
        ) : (
          <Button onClick={onResume} className="flex-1" disabled={isLoading}>
            <Play className="size-4" />
            Resume
          </Button>
        )}
        <Button variant="destructive" onClick={onStop} className="flex-1" disabled={isLoading}>
          <Square className="size-4" />
          Stop
        </Button>
      </div>
    </div>
  );
}

function DoneView({
  stepCount,
  steps,
  onEditInApp,
  onNewRecording,
}: {
  stepCount: number;
  steps: StepThumbnail[];
  onEditInApp: () => void;
  onNewRecording: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Summary */}
      <div className="px-4 py-2">
        <span className="text-sm text-muted-foreground">
          {stepCount} step{stepCount !== 1 ? "s" : ""} captured
        </span>
      </div>

      {/* Step thumbnails */}
      <StepList steps={steps} />

      {/* Actions */}
      <div className="flex gap-2 border-t px-4 py-3">
        <Button onClick={onEditInApp} className="flex-1">
          <ExternalLink className="size-4" />
          Edit in App
        </Button>
        <Button variant="outline" onClick={onNewRecording} className="flex-1">
          New Recording
        </Button>
      </div>
    </div>
  );
}

function StepList({ steps }: { steps: StepThumbnail[] }) {
  if (steps.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="text-xs text-muted-foreground">
          No steps captured yet. Interact with the page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-1.5 overflow-y-auto px-4 py-2">
      {steps.map((step) => (
        <StepCard key={step.orderIndex} step={step} />
      ))}
    </div>
  );
}

function StepCard({ step }: { step: StepThumbnail }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-card p-1.5">
      <img
        src={step.screenshotDataUrl}
        alt={`Step ${step.orderIndex + 1}`}
        className="h-10 w-16 flex-shrink-0 rounded object-cover"
      />
      <div className="flex min-w-0 flex-1 items-center justify-between">
        <span className="text-xs font-medium text-foreground">
          Step {step.orderIndex + 1}
        </span>
        <Badge variant="outline" className="text-[10px]">
          {step.actionType}
        </Badge>
      </div>
    </div>
  );
}
