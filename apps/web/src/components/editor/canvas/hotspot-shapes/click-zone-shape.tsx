import type Konva from "konva";
import { Rect } from "react-konva";

import {
  HOTSPOT_BRANCHING_RGB,
  HOTSPOT_DEFAULT_RGB,
  parseClickZoneStyle,
} from "../../constants";

import type { HotspotShapeProps } from "./types";

import { hexToRgb } from "@/lib/editor/color-utils";

export function ClickZoneShape({
  hotspot,
  isSelected,
  isSelectMode,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: HotspotShapeProps) {
  const { backgroundColor, opacity } = parseClickZoneStyle(hotspot.style);

  const isBranching = hotspot.targetStepId != null;
  const customRgb = hotspot.style?.backgroundColor
    ? hexToRgb(backgroundColor)
    : null;
  const baseColor = customRgb
    ? customRgb
    : isBranching
      ? HOTSPOT_BRANCHING_RGB
      : HOTSPOT_DEFAULT_RGB;

  // Render as a Rect with max cornerRadius to create a circle/pill shape.
  // This keeps the same event model as the original Rect (no Group issues).
  const cornerRadius = Math.min(hotspot.width, hotspot.height) / 2;

  return (
    <Rect
      id={hotspot.id}
      x={hotspot.x}
      y={hotspot.y}
      width={hotspot.width}
      height={hotspot.height}
      cornerRadius={cornerRadius}
      fill={`rgba(${baseColor}, ${opacity})`}
      stroke={
        isSelected
          ? `rgba(${baseColor}, 0.9)`
          : `rgba(${baseColor}, 0.6)`
      }
      strokeWidth={isSelected ? 2 : 1}
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
        // Keep circle square after transform
        const size = Math.max(
          20,
          Math.max(node.width() * scaleX, node.height() * scaleY),
        );
        onTransformEnd(hotspot.id, {
          x: node.x(),
          y: node.y(),
          width: size,
          height: size,
        });
      }}
    />
  );
}
