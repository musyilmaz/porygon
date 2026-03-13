"use client";

import { Button } from "@porygon/ui/components/button";
import { cn } from "@porygon/ui/lib/utils";
import { PanelLeft, PanelRight } from "lucide-react";

import { CanvasPanel } from "./canvas-panel";
import { PropertiesSidebar } from "./properties-sidebar";
import { TimelineSidebar } from "./timeline-sidebar";

import { useEditorStore } from "@/stores/editor/editor-store-provider";

export function EditorLayout() {
  const leftSidebarOpen = useEditorStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useEditorStore((s) => s.rightSidebarOpen);
  const toggleLeftSidebar = useEditorStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useEditorStore((s) => s.toggleRightSidebar);

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {/* Left sidebar toggle (visible when sidebar is closed) */}
      {!leftSidebarOpen && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 left-2 z-10"
          onClick={toggleLeftSidebar}
          title="Show timeline"
        >
          <PanelLeft className="size-4" />
        </Button>
      )}

      {/* Left sidebar - Timeline */}
      <div
        className={cn(
          "border-border shrink-0 border-r transition-all duration-200",
          leftSidebarOpen ? "w-[260px]" : "w-0 overflow-hidden border-r-0",
        )}
      >
        <div className="relative flex h-full w-[260px] flex-col">
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute top-1.5 right-1.5 z-10"
            onClick={toggleLeftSidebar}
            title="Hide timeline"
          >
            <PanelLeft className="size-3" />
          </Button>
          <TimelineSidebar />
        </div>
      </div>

      {/* Center canvas */}
      <div className="bg-muted/30 flex-1 overflow-hidden">
        <CanvasPanel />
      </div>

      {/* Right sidebar - Properties */}
      <div
        className={cn(
          "border-border shrink-0 border-l transition-all duration-200",
          rightSidebarOpen ? "w-[300px]" : "w-0 overflow-hidden border-l-0",
        )}
      >
        <div className="relative flex h-full w-[300px] flex-col">
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute top-1.5 right-1.5 z-10"
            onClick={toggleRightSidebar}
            title="Hide properties"
          >
            <PanelRight className="size-3" />
          </Button>
          <PropertiesSidebar />
        </div>
      </div>

      {/* Right sidebar toggle (visible when sidebar is closed) */}
      {!rightSidebarOpen && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2 z-10"
          onClick={toggleRightSidebar}
          title="Show properties"
        >
          <PanelRight className="size-4" />
        </Button>
      )}
    </div>
  );
}
