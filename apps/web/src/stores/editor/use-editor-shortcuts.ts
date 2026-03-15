"use client";

import { useEffect } from "react";

import { useEditorTemporalStore, useEditorStore } from "./editor-store-provider";

export function useEditorShortcuts() {
  const undo = useEditorTemporalStore((s) => s.undo);
  const redo = useEditorTemporalStore((s) => s.redo);
  const setTool = useEditorStore((s) => s.setTool);
  const selectHotspot = useEditorStore((s) => s.selectHotspot);
  const selectAnnotation = useEditorStore((s) => s.selectAnnotation);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

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
      } else if (e.key === "Escape") {
        e.preventDefault();
        selectHotspot(null);
        selectAnnotation(null);
        setTool("select");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, setTool, selectHotspot, selectAnnotation]);
}
