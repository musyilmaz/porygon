import { Button } from "@porygon/ui/components/button";
import { Maximize, Minus, Plus } from "lucide-react";

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export function ZoomControls({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onFit,
}: ZoomControlsProps) {
  const percentage = Math.round(zoomLevel * 100);

  return (
    <div className="bg-background/80 border-border absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border px-1 py-1 shadow-sm backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onZoomOut}
        title="Zoom out"
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="text-muted-foreground w-12 text-center text-xs tabular-nums">
        {percentage}%
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onZoomIn}
        title="Zoom in"
      >
        <Plus className="size-3.5" />
      </Button>
      <div className="bg-border mx-0.5 h-4 w-px" />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onFit}
        title="Fit to screen"
      >
        <Maximize className="size-3.5" />
      </Button>
    </div>
  );
}
