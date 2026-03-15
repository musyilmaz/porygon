import type Konva from "konva";
import { Rect } from "react-konva";

import type { EditorHotspot } from "@/stores/editor/types";

interface HotspotOverlayProps {
  hotspots: EditorHotspot[];
  selectedHotspotId: string | null;
  activeTool: string;
  onSelect: (hotspotId: string) => void;
  onDragEnd: (hotspotId: string, x: number, y: number) => void;
  onTransformEnd: (
    hotspotId: string,
    attrs: { x: number; y: number; width: number; height: number },
  ) => void;
}

export function HotspotOverlay({
  hotspots,
  selectedHotspotId,
  activeTool,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: HotspotOverlayProps) {
  const isSelectMode = activeTool === "select";

  return (
    <>
      {hotspots.map((hotspot) => (
        <Rect
          key={hotspot.id}
          id={hotspot.id}
          x={hotspot.x}
          y={hotspot.y}
          width={hotspot.width}
          height={hotspot.height}
          fill="rgba(59, 130, 246, 0.3)"
          stroke={
            selectedHotspotId === hotspot.id
              ? "rgba(59, 130, 246, 0.9)"
              : "rgba(59, 130, 246, 0.6)"
          }
          strokeWidth={selectedHotspotId === hotspot.id ? 2 : 1}
          draggable={isSelectMode}
          onClick={() => {
            if (isSelectMode) onSelect(hotspot.id);
          }}
          onTap={() => {
            if (isSelectMode) onSelect(hotspot.id);
          }}
          onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
            onDragEnd(hotspot.id, e.target.x(), e.target.y());
          }}
          onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onTransformEnd(hotspot.id, {
              x: node.x(),
              y: node.y(),
              width: Math.max(20, node.width() * scaleX),
              height: Math.max(20, node.height() * scaleY),
            });
          }}
        />
      ))}
    </>
  );
}
