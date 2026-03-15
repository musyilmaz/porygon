import { Rect } from "react-konva";

import type { EditorAnnotation } from "@/stores/editor/types";

interface CropDimOverlayProps {
  crop: EditorAnnotation | undefined;
  imageWidth: number;
  imageHeight: number;
}

const DIM_FILL = "rgba(0, 0, 0, 0.5)";

export function CropDimOverlay({ crop, imageWidth, imageHeight }: CropDimOverlayProps) {
  if (!crop) return null;

  const { x, y, width, height } = crop;

  return (
    <>
      {/* Top */}
      <Rect x={0} y={0} width={imageWidth} height={y} fill={DIM_FILL} listening={false} />
      {/* Bottom */}
      <Rect x={0} y={y + height} width={imageWidth} height={imageHeight - y - height} fill={DIM_FILL} listening={false} />
      {/* Left */}
      <Rect x={0} y={y} width={x} height={height} fill={DIM_FILL} listening={false} />
      {/* Right */}
      <Rect x={x + width} y={y} width={imageWidth - x - width} height={height} fill={DIM_FILL} listening={false} />
      {/* Crop border (non-interactive visual) */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="transparent"
        stroke="rgba(255, 255, 255, 0.9)"
        strokeWidth={1.5}
        dash={[6, 3]}
        listening={false}
      />
    </>
  );
}
