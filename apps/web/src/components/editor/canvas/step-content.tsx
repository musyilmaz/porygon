import { memo } from "react";
import { Image as KonvaImage } from "react-konva";

import { getMediaDimensions } from "@/lib/editor/media-utils";

interface StepContentProps {
  image: HTMLImageElement | HTMLVideoElement;
}

export const StepContent = memo(function StepContent({
  image,
}: StepContentProps) {
  const { width, height } = getMediaDimensions(image);
  return (
    <KonvaImage
      image={image}
      x={0}
      y={0}
      width={width}
      height={height}
      listening={false}
    />
  );
});
