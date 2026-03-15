import { memo } from "react";
import { Image as KonvaImage } from "react-konva";

interface StepContentProps {
  image: HTMLImageElement;
}

export const StepContent = memo(function StepContent({
  image,
}: StepContentProps) {
  return (
    <KonvaImage
      image={image}
      x={0}
      y={0}
      width={image.naturalWidth}
      height={image.naturalHeight}
      listening={false}
    />
  );
});
