import type Konva from "konva";
import { Rect } from "react-konva";

import { getAnnotationColors } from "@/components/editor/constants";
import type { EditorAnnotation } from "@/stores/editor/types";

interface AnnotationOverlayProps {
  annotations: EditorAnnotation[];
  selectedAnnotationId: string | null;
  activeTool: string;
  onSelect: (annotationId: string) => void;
  onDragEnd: (annotationId: string, x: number, y: number) => void;
  onTransformEnd: (
    annotationId: string,
    attrs: { x: number; y: number; width: number; height: number },
  ) => void;
}

export function AnnotationOverlay({
  annotations,
  selectedAnnotationId,
  activeTool,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: AnnotationOverlayProps) {
  const isSelectMode = activeTool === "select";

  return (
    <>
      {annotations.map((annotation) => {
        const isCrop = annotation.type === "crop";
        const colors = isCrop
          ? { fill: "transparent", stroke: "rgba(255, 255, 255, 0.9)" }
          : getAnnotationColors(annotation);
        const isSelected = selectedAnnotationId === annotation.id;

        return (
          <Rect
            key={annotation.id}
            id={annotation.id}
            x={annotation.x}
            y={annotation.y}
            width={annotation.width}
            height={annotation.height}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={isSelected ? 2 : 1}
            dash={isCrop ? [6, 3] : undefined}
            draggable={isSelectMode}
            onClick={() => {
              if (isSelectMode) onSelect(annotation.id);
            }}
            onTap={() => {
              if (isSelectMode) onSelect(annotation.id);
            }}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              onDragEnd(annotation.id, e.target.x(), e.target.y());
            }}
            onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              node.scaleX(1);
              node.scaleY(1);
              onTransformEnd(annotation.id, {
                x: node.x(),
                y: node.y(),
                width: Math.max(20, node.width() * scaleX),
                height: Math.max(20, node.height() * scaleY),
              });
            }}
          />
        );
      })}
    </>
  );
}
