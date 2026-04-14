import type { PointerDirection } from "@porygon/shared";
import type Konva from "konva";
import { Shape } from "react-konva";

import {
  CALLOUT_BODY_CORNER_RADIUS,
  CALLOUT_POINTER_BASE,
  CALLOUT_POINTER_HEIGHT,
  parseCalloutStyle,
} from "../../constants";

import type { HotspotShapeProps } from "./types";

import { hexToRgb } from "@/lib/editor/color-utils";

function drawPointer(
  ctx: Konva.Context,
  w: number,
  h: number,
  direction: PointerDirection,
) {
  const halfBase = CALLOUT_POINTER_BASE / 2;
  const pH = CALLOUT_POINTER_HEIGHT;

  let x0: number, y0: number, tipX: number, tipY: number, x1: number, y1: number;

  switch (direction) {
    case "bottom":
      x0 = w / 2 - halfBase; y0 = h; tipX = w / 2; tipY = h + pH; x1 = w / 2 + halfBase; y1 = h;
      break;
    case "top":
      x0 = w / 2 - halfBase; y0 = 0; tipX = w / 2; tipY = -pH; x1 = w / 2 + halfBase; y1 = 0;
      break;
    case "left":
      x0 = 0; y0 = h / 2 - halfBase; tipX = -pH; tipY = h / 2; x1 = 0; y1 = h / 2 + halfBase;
      break;
    case "right":
      x0 = w; y0 = h / 2 - halfBase; tipX = w + pH; tipY = h / 2; x1 = w; y1 = h / 2 + halfBase;
      break;
    case "bottom-left":
      x0 = 0; y0 = h; tipX = -pH; tipY = h + pH; x1 = halfBase * 2; y1 = h;
      break;
    case "bottom-right":
      x0 = w - halfBase * 2; y0 = h; tipX = w + pH; tipY = h + pH; x1 = w; y1 = h;
      break;
    case "top-left":
      x0 = 0; y0 = 0; tipX = -pH; tipY = -pH; x1 = halfBase * 2; y1 = 0;
      break;
    case "top-right":
      x0 = w - halfBase * 2; y0 = 0; tipX = w + pH; tipY = -pH; x1 = w; y1 = 0;
      break;
  }

  ctx.moveTo(x0, y0);
  ctx.lineTo(tipX, tipY);
  ctx.lineTo(x1, y1);
}

function drawRoundedRect(
  ctx: Konva.Context,
  w: number,
  h: number,
  r: number,
) {
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.arcTo(w, 0, w, r, r);
  ctx.lineTo(w, h - r);
  ctx.arcTo(w, h, w - r, h, r);
  ctx.lineTo(r, h);
  ctx.arcTo(0, h, 0, h - r, r);
  ctx.lineTo(0, r);
  ctx.arcTo(0, 0, r, 0, r);
}

export function CalloutShape({
  hotspot,
  isSelected,
  isSelectMode,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: HotspotShapeProps) {
  const { backgroundColor, pointerDirection } = parseCalloutStyle(
    hotspot.style,
  );

  const fillRgb = hexToRgb(backgroundColor) ?? "31, 41, 55";
  const fillColor = `rgba(${fillRgb}, 0.9)`;
  const strokeColor = isSelected
    ? `rgba(${fillRgb}, 1)`
    : `rgba(${fillRgb}, 0.7)`;

  const r = Math.min(
    CALLOUT_BODY_CORNER_RADIUS,
    hotspot.width / 2,
    hotspot.height / 2,
  );

  return (
    <Shape
      id={hotspot.id}
      x={hotspot.x}
      y={hotspot.y}
      width={hotspot.width}
      height={hotspot.height}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={isSelected ? 2 : 1}
      sceneFunc={(ctx, shape) => {
        const w = shape.width();
        const h = shape.height();
        ctx.beginPath();
        drawRoundedRect(ctx, w, h, r);
        drawPointer(ctx, w, h, pointerDirection);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
      hitFunc={(ctx, shape) => {
        const w = shape.width();
        const h = shape.height();
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
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
