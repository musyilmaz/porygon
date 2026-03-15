"use client";

import { Button } from "@porygon/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@porygon/ui/components/tooltip";
import { ArrowLeft, Keyboard, Play, Redo2, Undo2 } from "lucide-react";
import Link from "next/link";

import { SaveIndicator } from "./save-indicator";

import {
  useEditorStore,
  useEditorTemporalStore,
} from "@/stores/editor/editor-store-provider";

export function EditorHeader() {
  const title = useEditorStore((s) => s.demo.title);
  const steps = useEditorStore((s) => s.steps);
  const setPreviewOpen = useEditorStore((s) => s.setPreviewOpen);
  const setShortcutsHelpOpen = useEditorStore((s) => s.setShortcutsHelpOpen);
  const undo = useEditorTemporalStore((s) => s.undo);
  const redo = useEditorTemporalStore((s) => s.redo);
  const pastStates = useEditorTemporalStore((s) => s.pastStates);
  const futureStates = useEditorTemporalStore((s) => s.futureStates);

  const hasPlayableSteps = steps.some((s) => s.screenshotUrl !== null);

  return (
    <header className="border-border flex h-12 shrink-0 items-center gap-3 border-b px-3">
      <Button variant="ghost" size="icon-sm" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="size-4" />
        </Link>
      </Button>

      <div className="border-border h-5 border-l" />

      <span className="truncate text-sm font-medium">{title}</span>

      <SaveIndicator />

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShortcutsHelpOpen(true)}
          >
            <Keyboard className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Keyboard shortcuts (?)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setPreviewOpen(true)}
            disabled={!hasPlayableSteps}
          >
            <Play className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Preview (Ctrl+P)</TooltipContent>
      </Tooltip>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => undo()}
          disabled={pastStates.length === 0}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => redo()}
          disabled={futureStates.length === 0}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="size-4" />
        </Button>
      </div>
    </header>
  );
}
