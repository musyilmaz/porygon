import { Button } from "@porygon/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@porygon/ui/components/tooltip";
import { MousePointer2, Square } from "lucide-react";

import { useEditorStore } from "@/stores/editor/editor-store-provider";

export function CanvasToolbar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setTool = useEditorStore((s) => s.setTool);

  return (
    <div className="bg-background/80 border-border absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border px-1 py-1 shadow-sm backdrop-blur-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={activeTool === "select" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setTool("select")}
          >
            <MousePointer2 className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          Select (V)
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={activeTool === "hotspot" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setTool("hotspot")}
          >
            <Square className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          Hotspot (H)
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
