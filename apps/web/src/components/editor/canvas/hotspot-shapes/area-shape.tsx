import type Konva from "konva";
import { Rect } from "react-konva";

import {
  HOTSPOT_BRANCHING_RGB,
  HOTSPOT_DEFAULT_RGB,
  parseAreaStyle,
} from "../../constants";

import type { HotspotShapeProps } from "./types";

import { hexToRgb } from "@/lib/editor/color-utils";

export function AreaShape({
  hotspot,
  isSelected,
  isSelectMode,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: HotspotShapeProps) {
  const { borderColor, borderWidth, overlayColor, overlayOpacity, shape } =
    parseAreaStyle(hotspot.style);

  const overlayRgb = hexToRgb(overlayColor) ?? HOTSPOT_DEFAULT_RGB;
  const borderRgb = hexToRgb(borderColor) ?? HOTSPOT_DEFAULT_RGB;
  const isBranching = hotspot.targetStepId != null;

  const strokeColor = isSelected
    ? `rgba(${borderRgb}, 1)`
    : `rgba(${isBranching ? HOTSPOT_BRANCHING_RGB : borderRgb}, 0.8)`;

  return (
    <Rect
      id={hotspot.id}
      x={hotspot.x}
      y={hotspot.y}
      width={hotspot.width}
      height={hotspot.height}
      fill={`rgba(${overlayRgb}, ${overlayOpacity})`}
      stroke={strokeColor}
      strokeWidth={isSelected ? Math.max(borderWidth, 2) : borderWidth}
      cornerRadius={shape === "rounded" ? 8 : 0}
      dash={isSelected ? undefined : [6, 3]}
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
  );
}
