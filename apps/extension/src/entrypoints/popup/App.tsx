import { useCallback, useEffect, useState } from "react";

import type { StateResponse } from "@/types/messages";

export function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    browser.runtime
      .sendMessage({ type: "GET_STATE" })
      .then((response: StateResponse) => {
        setIsRecording(response.isRecording);
        setStepCount(response.stepCount);
      })
      .catch(() => setError("Failed to get state"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isRecording) {
        const response = await browser.runtime.sendMessage({
          type: "STOP_RECORDING",
        });
        setIsRecording(false);
        setStepCount(response.stepCount);
      } else {
        await browser.runtime.sendMessage({ type: "START_RECORDING" });
        setIsRecording(true);
        setStepCount(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [isRecording]);

  return (
    <div style={{ width: 320, padding: 16 }}>
      <h1 style={{ margin: 0, fontSize: 18 }}>Porygon</h1>

      <p style={{ color: "#666", fontSize: 14, marginBottom: 12 }}>
        {isRecording
          ? `Recording... ${stepCount} step${stepCount !== 1 ? "s" : ""}`
          : stepCount > 0
            ? `${stepCount} step${stepCount !== 1 ? "s" : ""} captured`
            : "Ready to capture"}
      </p>

      <button
        onClick={handleToggle}
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "8px 16px",
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          backgroundColor: isLoading
            ? "#999"
            : isRecording
              ? "#dc2626"
              : "#2563eb",
          border: "none",
          borderRadius: 6,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading
          ? "..."
          : isRecording
            ? "Stop Recording"
            : "Start Recording"}
      </button>

      {error && (
        <p style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}
