"use client";

import { useEditorStore } from "@/stores/editor/editor-store-provider";

export function SaveIndicator() {
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const saveError = useEditorStore((s) => s.saveError);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);

  if (saveError) {
    return (
      <span className="text-destructive text-xs font-medium">Save failed</span>
    );
  }

  if (isSaving) {
    return (
      <span className="text-muted-foreground text-xs font-medium">
        Saving...
      </span>
    );
  }

  if (isDirty) {
    return (
      <span className="text-muted-foreground text-xs font-medium">
        Unsaved changes
      </span>
    );
  }

  if (lastSavedAt) {
    return (
      <span className="text-muted-foreground text-xs font-medium">Saved</span>
    );
  }

  return null;
}
