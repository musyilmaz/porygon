"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { useStepActions } from "@/hooks/editor/use-step-actions";

import { DeleteStepDialog } from "./delete-step-dialog";
import { SortableStepCard } from "./sortable-step-card";

import { useEditorStore } from "@/stores/editor/editor-store-provider";
import type { EditorStep } from "@/stores/editor/types";

export function TimelineSidebar() {
  const steps = useEditorStore((s) => s.steps);
  const selectedStepIndex = useEditorStore((s) => s.selectedStepIndex);
  const selectStep = useEditorStore((s) => s.selectStep);
  const { createStep, deleteStep, duplicateStep, reorderSteps } =
    useStepActions();

  const [activeStep, setActiveStep] = useState<EditorStep | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const step = steps.find((s) => s.id === event.active.id);
      if (step) setActiveStep(step);
    },
    [steps],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveStep(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const fromIndex = steps.findIndex((s) => s.id === active.id);
      const toIndex = steps.findIndex((s) => s.id === over.id);
      if (fromIndex === -1 || toIndex === -1) return;

      reorderSteps(fromIndex, toIndex);
    },
    [steps, reorderSteps],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      createStep(file, insertAtIndex ?? undefined);
      setInsertAtIndex(null);

      // Reset input so the same file can be selected again
      event.target.value = "";
    },
    [createStep, insertAtIndex],
  );

  const handleAddStep = useCallback(() => {
    setInsertAtIndex(null);
    fileInputRef.current?.click();
  }, []);

  const handleInsertBefore = useCallback(
    (index: number) => {
      setInsertAtIndex(index);
      fileInputRef.current?.click();
    },
    [],
  );

  const handleInsertAfter = useCallback(
    (index: number) => {
      setInsertAtIndex(index + 1);
      fileInputRef.current?.click();
    },
    [],
  );

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteStep(deleteTarget);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteStep]);

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="border-border flex h-10 shrink-0 items-center border-b px-3">
          <span className="text-xs font-medium uppercase tracking-wide">
            Steps
          </span>
          <span className="text-muted-foreground ml-1.5 text-xs">
            {steps.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {steps.length === 0 ? (
            <p className="text-muted-foreground px-2 py-4 text-center text-xs">
              No steps yet
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-1.5">
                  {steps.map((step, index) => (
                    <SortableStepCard
                      key={step.id}
                      step={step}
                      index={index}
                      isSelected={index === selectedStepIndex}
                      onSelect={() => selectStep(index)}
                      onDelete={() => setDeleteTarget(step.id)}
                      onDuplicate={() => duplicateStep(step.id)}
                      onInsertBefore={() => handleInsertBefore(index)}
                      onInsertAfter={() => handleInsertAfter(index)}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeStep && (
                  <div className="border-primary bg-accent w-full rounded-md border p-1.5 opacity-90 shadow-lg">
                    <div className="bg-muted aspect-video w-full overflow-hidden rounded-sm">
                      {activeStep.screenshotUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={activeStep.screenshotUrl}
                          alt="Dragging step"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-muted-foreground text-[10px]">
                            No screenshot
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
        <div className="border-border shrink-0 border-t p-2">
          <button
            onClick={handleAddStep}
            className="border-border hover:bg-accent flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-1.5 text-xs transition-colors"
          >
            <Plus className="size-3.5" />
            Add Step
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <DeleteStepDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
