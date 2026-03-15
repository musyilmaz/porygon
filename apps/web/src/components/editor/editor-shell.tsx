"use client";

import { EditorHeader } from "./editor-header";
import { EditorLayout } from "./editor-layout";

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
      <EditorInner />
    </EditorStoreProvider>
  );
}
