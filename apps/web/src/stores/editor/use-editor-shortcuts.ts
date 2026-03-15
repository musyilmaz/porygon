"use client";

import { useEffect } from "react";

import { useEditorTemporalStore, useEditorStore } from "./editor-store-provider";

import { useAnnotationActions } from "@/hooks/editor/use-annotation-actions";
import { useHotspotActions } from "@/hooks/editor/use-hotspot-actions";
import { isTypingTarget } from "@/lib/editor/keyboard-utils";

export function useEditorShortcuts() {
  const undo = useEditorTemporalStore((s) => s.undo);
  const redo = useEditorTemporalStore((s) => s.redo);
  const setTool = useEditorStore((s) => s.setTool);
  const selectHotspot = useEditorStore((s) => s.selectHotspot);
  const selectAnnotation = useEditorStore((s) => s.selectAnnotation);
  const steps = useEditorStore((s) => s.steps);
  const selectedStepIndex = useEditorStore((s) => s.selectedStepIndex);
  const selectedHotspotId = useEditorStore((s) => s.selectedHotspotId);
  const selectedAnnotationId = useEditorStore((s) => s.selectedAnnotationId);

  const { deleteHotspot } = useHotspotActions();
  const { deleteAnnotation } = useAnnotationActions();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e)) return;

      const mod = e.metaKey || e.ctrlKey;

      // Mod shortcuts (undo/redo)
      if (mod) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (
          (e.key === "z" && e.shiftKey) ||
          (e.key === "y" && !e.shiftKey)
        ) {
          e.preventDefault();
          redo();
        }
        return;
      }

      // Tool switching (no modifier)
      if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        setTool("select");
      } else if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        setTool("hotspot");
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        setTool("blur");
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        setTool("highlight");
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setTool("crop");
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const selectedStep = steps[selectedStepIndex];
        if (!selectedStep) return;

        if (selectedHotspotId) {
          e.preventDefault();
          deleteHotspot(selectedStep.id, selectedHotspotId);
        } else if (selectedAnnotationId) {
          e.preventDefault();
          deleteAnnotation(selectedStep.id, selectedAnnotationId);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        selectHotspot(null);
        selectAnnotation(null);
        setTool("select");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    setTool,
    selectHotspot,
    selectAnnotation,
    steps,
    selectedStepIndex,
    selectedHotspotId,
    selectedAnnotationId,
    deleteHotspot,
    deleteAnnotation,
  ]);
}
