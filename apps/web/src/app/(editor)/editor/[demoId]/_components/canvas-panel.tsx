"use client";

import { useEditorStore } from "@/stores/editor/editor-store-provider";

export function CanvasPanel() {
  const steps = useEditorStore((s) => s.steps);
  const selectedStepIndex = useEditorStore((s) => s.selectedStepIndex);
  const selectedStep = steps[selectedStepIndex];

  if (!selectedStep) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">
          No steps in this demo yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center overflow-auto p-6">
      {selectedStep.screenshotUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={selectedStep.screenshotUrl}
          alt={`Step ${selectedStepIndex + 1}`}
          className="max-h-full max-w-full rounded-md shadow-md"
        />
      ) : (
        <div className="bg-muted flex aspect-video w-full max-w-2xl items-center justify-center rounded-md">
          <p className="text-muted-foreground text-sm">No screenshot</p>
        </div>
      )}
    </div>
  );
}
