"use client";

import { useCallback, useEffect, useRef } from "react";

import { useEditorStore } from "./editor-store-provider";

const AUTO_SAVE_DELAY = 2000;

export function useAutoSave() {
  const demoId = useEditorStore((s) => s.demoId);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const demo = useEditorStore((s) => s.demo);
  const setSaving = useEditorStore((s) => s.setSaving);
  const setSaved = useEditorStore((s) => s.setSaved);
  const setSaveError = useEditorStore((s) => s.setSaveError);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSaving(true);

    try {
      const response = await fetch(`/api/demos/${demoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: demo.title,
          description: demo.description,
          slug: demo.slug,
          status: demo.status,
          settings: demo.settings,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json();
        setSaveError(data.error ?? "Failed to save");
        return;
      }

      setSaved();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setSaveError("Failed to save");
    }
  }, [demoId, demo, setSaving, setSaved, setSaveError]);

  useEffect(() => {
    if (!isDirty || isSaving) return;

    timerRef.current = setTimeout(() => {
      void save();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDirty, isSaving, save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
}
