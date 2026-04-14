"use client";

import { useCallback } from "react";

import { apiError, fetchOpts } from "@/lib/editor/api-utils";
import { useEditorStore } from "@/stores/editor/editor-store-provider";
import type { EditorStep } from "@/stores/editor/types";

export function useStepActions() {
  const demoId = useEditorStore((s) => s.demoId);
  const steps = useEditorStore((s) => s.steps);
  const addStep = useEditorStore((s) => s.addStep);
  const insertStep = useEditorStore((s) => s.insertStep);
  const removeStep = useEditorStore((s) => s.removeStep);
  const reorderSteps = useEditorStore((s) => s.reorderSteps);
  const selectStep = useEditorStore((s) => s.selectStep);
  const updateStep = useEditorStore((s) => s.updateStep);
  const setSaveError = useEditorStore((s) => s.setSaveError);

  const createStep = useCallback(
    async (file?: File, atIndex?: number) => {
      // 1. Create step via API
      const createRes = await fetch(`/api/demos/${demoId}/steps`, {
        ...fetchOpts,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!createRes.ok) {
        setSaveError(await apiError(createRes));
        return;
      }
      const created = await createRes.json();

      const newStep: EditorStep = {
        id: created.id,
        demoId: created.demoId,
        orderIndex: created.orderIndex,
        screenshotUrl: created.screenshotUrl,
        mediaType: created.mediaType ?? "image",
        videoUrl: created.videoUrl ?? null,
        actionType: created.actionType,
        actionCoordinates: created.actionCoordinates,
        hotspots: [],
        annotations: [],
      };

      // 2. Add to store at the right position
      if (atIndex !== undefined) {
        insertStep(newStep, atIndex);
      } else {
        addStep(newStep);
      }

      // 3. If file provided, upload screenshot via server proxy (non-fatal)
      if (file) {
        const uploadRes = await fetch(
          `/api/demos/${demoId}/steps/${created.id}/screenshot`,
          {
            ...fetchOpts,
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          },
        );
        if (uploadRes.ok) {
          const updated = await uploadRes.json();
          updateStep(created.id, { screenshotUrl: updated.screenshotUrl });
        } else {
          setSaveError(await apiError(uploadRes));
        }
      }

      // 4. If inserted at specific index, reorder on server
      if (atIndex !== undefined) {
        const currentSteps = [...steps];
        currentSteps.splice(atIndex, 0, newStep);

        await fetch(`/api/demos/${demoId}/steps/reorder`, {
          ...fetchOpts,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stepIds: currentSteps.map((s) => s.id),
          }),
        });
      }

      // Select the new step
      selectStep(atIndex ?? steps.length);
    },
    [
      demoId,
      steps,
      addStep,
      insertStep,
      updateStep,
      selectStep,
      setSaveError,
    ],
  );

  const deleteStep = useCallback(
    async (stepId: string) => {
      const stepIndex = steps.findIndex((s) => s.id === stepId);
      if (stepIndex === -1) return;
      const savedStep = steps[stepIndex]!;

      // Optimistic: remove immediately
      removeStep(stepId);

      const res = await fetch(`/api/demos/${demoId}/steps/${stepId}`, {
        ...fetchOpts,
        method: "DELETE",
      });
      if (!res.ok && res.status !== 404) {
        // Rollback on failure
        insertStep(savedStep, stepIndex);
        setSaveError(await apiError(res));
      }
    },
    [demoId, steps, removeStep, insertStep, setSaveError],
  );

  const duplicateStep = useCallback(
    async (stepId: string) => {
      const sourceIndex = steps.findIndex((s) => s.id === stepId);
      if (sourceIndex === -1) return;

      const res = await fetch(
        `/api/demos/${demoId}/steps/${stepId}/duplicate`,
        { ...fetchOpts, method: "POST" },
      );
      if (!res.ok) {
        setSaveError(await apiError(res));
        return;
      }
      const created = await res.json();

      const insertAt = sourceIndex + 1;
      const newStep: EditorStep = {
        id: created.id,
        demoId: created.demoId,
        orderIndex: insertAt,
        screenshotUrl: created.screenshotUrl,
        mediaType: created.mediaType ?? "image",
        videoUrl: created.videoUrl ?? null,
        actionType: created.actionType,
        actionCoordinates: created.actionCoordinates,
        hotspots: (created.hotspots ?? []).map((h: Record<string, unknown>) => ({
          id: h.id,
          stepId: h.stepId,
          type: h.type ?? "click_zone",
          x: h.x,
          y: h.y,
          width: h.width,
          height: h.height,
          targetStepId: h.targetStepId,
          tooltipContent: h.tooltipContent,
          tooltipPosition: h.tooltipPosition,
          style: h.style,
          openByDefault: h.openByDefault ?? false,
        })),
        annotations: (created.annotations ?? []).map(
          (a: Record<string, unknown>) => ({
            id: a.id,
            stepId: a.stepId,
            type: a.type,
            x: a.x,
            y: a.y,
            width: a.width,
            height: a.height,
            settings: a.settings,
          }),
        ),
      };

      insertStep(newStep, insertAt);

      // Reorder on server
      const updatedSteps = [...steps];
      updatedSteps.splice(insertAt, 0, newStep);
      await fetch(`/api/demos/${demoId}/steps/reorder`, {
        ...fetchOpts,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepIds: updatedSteps.map((s) => s.id),
        }),
      });

      selectStep(insertAt);
    },
    [demoId, steps, insertStep, selectStep, setSaveError],
  );

  const reorderStepsAction = useCallback(
    async (fromIndex: number, toIndex: number) => {
      // Optimistic: update store immediately
      reorderSteps(fromIndex, toIndex);

      // Build new order
      const reorderedSteps = [...steps];
      const [moved] = reorderedSteps.splice(fromIndex, 1);
      if (!moved) return;
      reorderedSteps.splice(toIndex, 0, moved);

      const res = await fetch(`/api/demos/${demoId}/steps/reorder`, {
        ...fetchOpts,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepIds: reorderedSteps.map((s) => s.id),
        }),
      });
      if (!res.ok) {
        reorderSteps(toIndex, fromIndex);
        setSaveError(await apiError(res));
      }
    },
    [demoId, steps, reorderSteps, setSaveError],
  );

  return {
    createStep,
    deleteStep,
    duplicateStep,
    reorderSteps: reorderStepsAction,
  };
}
