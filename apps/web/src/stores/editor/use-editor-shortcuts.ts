"use client";

import { useEffect } from "react";

import { useEditorTemporalStore } from "./editor-store-provider";

export function useEditorShortcuts() {
  const undo = useEditorTemporalStore((s) => s.undo);
  const redo = useEditorTemporalStore((s) => s.redo);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Ignore shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

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
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);
}
