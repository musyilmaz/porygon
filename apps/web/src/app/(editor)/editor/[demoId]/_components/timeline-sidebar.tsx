"use client";

import { cn } from "@porygon/ui/lib/utils";

import { useEditorStore } from "@/stores/editor/editor-store-provider";

export function TimelineSidebar() {
  const steps = useEditorStore((s) => s.steps);
  const selectedStepIndex = useEditorStore((s) => s.selectedStepIndex);
  const selectStep = useEditorStore((s) => s.selectStep);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-border flex h-10 shrink-0 items-center border-b px-3">
        <span className="text-xs font-medium uppercase tracking-wide">
          Steps
        </span>
        <span className="text-muted-foreground ml-auto text-xs">
          {steps.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {steps.length === 0 ? (
          <p className="text-muted-foreground px-2 py-4 text-center text-xs">
            No steps yet
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => selectStep(index)}
                className={cn(
                  "group relative flex flex-col gap-1 rounded-md border p-1.5 text-left transition-colors",
                  index === selectedStepIndex
                    ? "border-primary bg-accent"
                    : "border-border hover:border-border/80 hover:bg-accent/50",
                )}
              >
                <div className="bg-muted aspect-video w-full overflow-hidden rounded-sm">
                  {step.screenshotUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={step.screenshotUrl}
                      alt={`Step ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-muted-foreground text-xs">
                        No screenshot
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-muted-foreground truncate px-0.5 text-xs">
                  Step {index + 1}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
