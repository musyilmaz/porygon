"use client";

import { useCallback, useRef } from "react";

import { apiError, fetchOpts } from "@/lib/editor/api-utils";
import { useEditorStore } from "@/stores/editor/editor-store-provider";
import type { EditorAnnotation } from "@/stores/editor/types";

let tempIdCounter = 0;

export function useAnnotationActions() {
  const addAnnotation = useEditorStore((s) => s.addAnnotation);
  const removeAnnotation = useEditorStore((s) => s.removeAnnotation);
  const selectAnnotation = useEditorStore((s) => s.selectAnnotation);
  const setTool = useEditorStore((s) => s.setTool);
  const rightSidebarOpen = useEditorStore((s) => s.rightSidebarOpen);
  const toggleRightSidebar = useEditorStore((s) => s.toggleRightSidebar);
  const setSaveError = useEditorStore((s) => s.setSaveError);

  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const tempToRealId = useRef<Map<string, string>>(new Map());

  const resolveAnnotationId = useCallback((id: string) => {
    return tempToRealId.current.get(id) ?? id;
  }, []);

  const createAnnotation = useCallback(
    async (
      stepId: string,
      type: EditorAnnotation["type"],
      rect: { x: number; y: number; width: number; height: number },
    ) => {
      const tempId = `temp_annotation_${++tempIdCounter}`;
      const optimistic: EditorAnnotation = {
        id: tempId,
        stepId,
        type,
        ...rect,
        settings: null,
      };

      addAnnotation(stepId, optimistic);
      selectAnnotation(tempId);
      if (!rightSidebarOpen) {
        toggleRightSidebar();
      }
      setTool("select");

      const res = await fetch(`/api/steps/${stepId}/annotations`, {
        ...fetchOpts,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...rect }),
      });

      if (!res.ok) {
        removeAnnotation(stepId, tempId);
        setSaveError(await apiError(res));
        return;
      }

      const real: EditorAnnotation = await res.json();

      removeAnnotation(stepId, tempId);
      addAnnotation(stepId, real);
      selectAnnotation(real.id);
      tempToRealId.current.set(tempId, real.id);
    },
    [
      addAnnotation,
      removeAnnotation,
      selectAnnotation,
      setTool,
      rightSidebarOpen,
      toggleRightSidebar,
      setSaveError,
    ],
  );

  const saveAnnotation = useCallback(
    (
      stepId: string,
      annotationId: string,
      updates: Partial<Omit<EditorAnnotation, "id" | "stepId">>,
    ) => {
      const realId = resolveAnnotationId(annotationId);
      if (realId.startsWith("temp_annotation_")) return;

      const existing = debounceTimers.current.get(realId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(async () => {
        debounceTimers.current.delete(realId);
        const res = await fetch(
          `/api/steps/${stepId}/annotations/${realId}`,
          {
            ...fetchOpts,
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          },
        );
        if (!res.ok) {
          setSaveError(await apiError(res));
        }
      }, 500);

      debounceTimers.current.set(realId, timer);
    },
    [setSaveError, resolveAnnotationId],
  );

  const deleteAnnotation = useCallback(
    async (stepId: string, annotationId: string) => {
      const realId = resolveAnnotationId(annotationId);

      const existing = debounceTimers.current.get(realId);
      if (existing) {
        clearTimeout(existing);
        debounceTimers.current.delete(realId);
      }

      removeAnnotation(stepId, annotationId);

      if (realId.startsWith("temp_annotation_")) return;

      const res = await fetch(
        `/api/steps/${stepId}/annotations/${realId}`,
        {
          ...fetchOpts,
          method: "DELETE",
        },
      );
      if (!res.ok && res.status !== 404) {
        setSaveError(await apiError(res));
      }
    },
    [removeAnnotation, setSaveError, resolveAnnotationId],
  );

  return { createAnnotation, saveAnnotation, deleteAnnotation };
}
