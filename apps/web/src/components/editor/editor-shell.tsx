"use client";

import { TooltipProvider } from "@porygon/ui/components/tooltip";

import { EditorHeader } from "./editor-header";
import { EditorLayout } from "./editor-layout";
import { PreviewModal } from "./preview-modal";
import { ShortcutsDialog } from "./shortcuts-dialog";

import { EditorStoreProvider } from "@/stores/editor/editor-store-provider";
import type { EditorInitialData } from "@/stores/editor/types";
import { useAutoSave } from "@/stores/editor/use-auto-save";
import { useEditorShortcuts } from "@/stores/editor/use-editor-shortcuts";

function EditorInner() {
  useAutoSave();
  useEditorShortcuts();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <EditorHeader />
      <EditorLayout />
      <PreviewModal />
      <ShortcutsDialog />
    </div>
  );
}

export function EditorShell({
  initialData,
}: {
  initialData: EditorInitialData;
}) {
  return (
    <EditorStoreProvider initialData={initialData}>
      <TooltipProvider>
        <EditorInner />
      </TooltipProvider>
    </EditorStoreProvider>
  );
}
