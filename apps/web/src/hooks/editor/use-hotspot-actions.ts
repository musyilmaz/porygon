"use client";

import { useCallback, useRef } from "react";

import { useEditorStore } from "@/stores/editor/editor-store-provider";
import type { EditorHotspot } from "@/stores/editor/types";

const fetchOpts: RequestInit = { credentials: "include" };

async function apiError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const body = JSON.parse(text);
    return body.error ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

let tempIdCounter = 0;

export function useHotspotActions() {
  const addHotspot = useEditorStore((s) => s.addHotspot);
  const updateHotspot = useEditorStore((s) => s.updateHotspot);
  const removeHotspot = useEditorStore((s) => s.removeHotspot);
  const selectHotspot = useEditorStore((s) => s.selectHotspot);
  const setTool = useEditorStore((s) => s.setTool);
  const rightSidebarOpen = useEditorStore((s) => s.rightSidebarOpen);
  const toggleRightSidebar = useEditorStore((s) => s.toggleRightSidebar);
  const setSaveError = useEditorStore((s) => s.setSaveError);

  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Maps temp IDs to real IDs once server responds
  const tempToRealId = useRef<Map<string, string>>(new Map());

  const resolveHotspotId = useCallback((id: string) => {
    return tempToRealId.current.get(id) ?? id;
  }, []);

  const createHotspot = useCallback(
    async (
      stepId: string,
      data: { x: number; y: number; width: number; height: number },
    ) => {
      // Optimistic: add hotspot immediately with temp ID
      const tempId = `temp_hotspot_${++tempIdCounter}`;
      const optimistic: EditorHotspot = {
        id: tempId,
        stepId,
        ...data,
        targetStepId: null,
        tooltipContent: null,
        tooltipPosition: "bottom",
        style: null,
      };

      addHotspot(stepId, optimistic);
      selectHotspot(tempId);
      if (!rightSidebarOpen) {
        toggleRightSidebar();
      }
      setTool("select");

      // Sync with server in background
      const res = await fetch(`/api/steps/${stepId}/hotspots`, {
        ...fetchOpts,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Rollback optimistic add
        removeHotspot(stepId, tempId);
        setSaveError(await apiError(res));
        return;
      }

      const real: EditorHotspot = await res.json();

      // Replace temp hotspot with real one
      removeHotspot(stepId, tempId);
      addHotspot(stepId, real);
      selectHotspot(real.id);
      tempToRealId.current.set(tempId, real.id);
    },
    [
      addHotspot,
      removeHotspot,
      selectHotspot,
      setTool,
      rightSidebarOpen,
      toggleRightSidebar,
      setSaveError,
    ],
  );

  const saveHotspot = useCallback(
    (
      stepId: string,
      hotspotId: string,
      updates: Partial<Omit<EditorHotspot, "id" | "stepId">>,
    ) => {
      const realId = resolveHotspotId(hotspotId);
      // Don't save temp hotspots — they haven't been created on the server yet
      if (realId.startsWith("temp_hotspot_")) return;

      const existing = debounceTimers.current.get(realId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(async () => {
        debounceTimers.current.delete(realId);
        const res = await fetch(
          `/api/steps/${stepId}/hotspots/${realId}`,
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
    [setSaveError, resolveHotspotId],
  );

  const deleteHotspot = useCallback(
    async (stepId: string, hotspotId: string) => {
      const realId = resolveHotspotId(hotspotId);

      // Clear any pending save
      const existing = debounceTimers.current.get(realId);
      if (existing) {
        clearTimeout(existing);
        debounceTimers.current.delete(realId);
      }

      // Optimistic: remove immediately
      removeHotspot(stepId, hotspotId);

      // Skip server call for temp hotspots
      if (realId.startsWith("temp_hotspot_")) return;

      const res = await fetch(
        `/api/steps/${stepId}/hotspots/${realId}`,
        {
          ...fetchOpts,
          method: "DELETE",
        },
      );
      if (!res.ok && res.status !== 404) {
        setSaveError(await apiError(res));
      }
    },
    [removeHotspot, setSaveError, resolveHotspotId],
  );

  return { createHotspot, saveHotspot, deleteHotspot };
}
