import type Konva from "konva";
import { Rect } from "react-konva";

import type { EditorAnnotation } from "@/stores/editor/types";

const ANNOTATION_COLORS: Record<
  EditorAnnotation["type"],
  { fill: string; stroke: string }
> = {
  blur: { fill: "rgba(107, 114, 128, 0.4)", stroke: "rgba(107, 114, 128, 0.7)" },
  highlight: {
    fill: "rgba(234, 179, 8, 0.25)",
    stroke: "rgba(234, 179, 8, 0.7)",
  },
  crop: { fill: "rgba(0, 0, 0, 0.5)", stroke: "rgba(0, 0, 0, 0.8)" },
};

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
        const colors = ANNOTATION_COLORS[annotation.type];
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
            stroke={isSelected ? colors.stroke : colors.stroke}
            strokeWidth={isSelected ? 2 : 1}
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
