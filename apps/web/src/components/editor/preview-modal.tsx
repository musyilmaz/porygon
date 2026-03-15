"use client";

import type { PlayerConfig } from "@porygon/player";
import { DemoPlayerRenderer } from "@porygon/player";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@porygon/ui/components/dialog";
import { useEffect, useMemo, useRef } from "react";

import { mapToPlayerConfig } from "@/lib/editor/map-to-player-config";
import { useEditorStore } from "@/stores/editor/editor-store-provider";

function PlayerContainer({ config }: { config: PlayerConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<DemoPlayerRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    rendererRef.current = new DemoPlayerRenderer({
      container,
      config,
    });

    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, [config]);

  return <div ref={containerRef} className="size-full" />;
}

export function PreviewModal() {
  const isPreviewOpen = useEditorStore((s) => s.isPreviewOpen);
  const setPreviewOpen = useEditorStore((s) => s.setPreviewOpen);
  const demoId = useEditorStore((s) => s.demoId);
  const demo = useEditorStore((s) => s.demo);
  const steps = useEditorStore((s) => s.steps);

  const config = useMemo(
    () => (isPreviewOpen ? mapToPlayerConfig(demoId, demo, steps) : null),
    [isPreviewOpen, demoId, demo, steps],
  );

  return (
    <Dialog open={isPreviewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent
        className="max-h-[90vh] max-w-[90vw] gap-0 overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-[90vw]"
        showCloseButton
      >
        <DialogTitle className="sr-only">Demo Preview</DialogTitle>
        {config && config.steps.length > 0 && (
          <PlayerContainer config={config} />
        )}
        {config && config.steps.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No steps with screenshots to preview
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
