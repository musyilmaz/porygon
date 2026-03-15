import type Konva from "konva";
import { useEffect, useRef } from "react";
import { Transformer } from "react-konva";

interface SelectionTransformerProps {
  selectedId: string | null;
  layerRef: React.RefObject<Konva.Layer | null>;
}

export function SelectionTransformer({
  selectedId,
  layerRef,
}: SelectionTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const transformer = transformerRef.current;
    const layer = layerRef.current;
    if (!transformer || !layer) return;

    if (!selectedId) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    const node = layer.findOne(`#${selectedId}`);
    if (node) {
      transformer.nodes([node]);
    } else {
      transformer.nodes([]);
    }
    transformer.getLayer()?.batchDraw();
  }, [selectedId, layerRef]);

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={false}
      keepRatio={false}
      boundBoxFunc={(_oldBox, newBox) => {
        if (newBox.width < 20 || newBox.height < 20) {
          return {
            ...newBox,
            width: Math.max(20, newBox.width),
            height: Math.max(20, newBox.height),
          };
        }
        return newBox;
      }}
      borderStroke="rgba(59, 130, 246, 0.8)"
      anchorFill="#ffffff"
      anchorStroke="rgba(59, 130, 246, 0.8)"
      anchorSize={8}
      anchorCornerRadius={2}
    />
  );
}
