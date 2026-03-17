"use client";

import { toast } from "@porygon/ui/components/sonner";
import { TooltipProvider } from "@porygon/ui/components/tooltip";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { EditorHeader } from "./editor-header";
import { EditorLayout } from "./editor-layout";
import { PreviewModal } from "./preview-modal";
import { ShortcutsDialog } from "./shortcuts-dialog";

import { ShareModal } from "@/components/share-modal";
import {
  EditorStoreProvider,
  useEditorStore,
} from "@/stores/editor/editor-store-provider";
import type { EditorInitialData } from "@/stores/editor/types";
import { useAutoSave } from "@/stores/editor/use-auto-save";
import { useEditorShortcuts } from "@/stores/editor/use-editor-shortcuts";

function EditorShareModal() {
  const slug = useEditorStore((s) => s.demo.slug);
  const status = useEditorStore((s) => s.demo.status);
  const isShareOpen = useEditorStore((s) => s.isShareOpen);
  const setShareOpen = useEditorStore((s) => s.setShareOpen);

  return (
    <ShareModal
      slug={slug}
      status={status}
      open={isShareOpen}
      onOpenChange={setShareOpen}
    />
  );
}

function EditorInner() {
  useAutoSave();
  useEditorShortcuts();

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      toast.success("Demo created — start adding hotspots and annotations");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <EditorHeader />
      <EditorLayout />
      <PreviewModal />
      <ShortcutsDialog />
      <EditorShareModal />
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
