import type Konva from "konva";
import { useCallback, useRef, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";

import { AnnotationOverlay } from "./annotation-overlay";
import { CropDimOverlay } from "./crop-dim-overlay";
import { HotspotOverlay } from "./hotspot-overlay";
import { SelectionTransformer } from "./selection-transformer";
import { StepContent } from "./step-content";

import {
  MIN_DRAW_SIZE,
  PREVIEW_COLORS,
  isDrawingTool,
  parseCropSettings,
} from "@/components/editor/constants";
import { useAnnotationActions } from "@/hooks/editor/use-annotation-actions";
import { useHotspotActions } from "@/hooks/editor/use-hotspot-actions";
import { useEditorStore } from "@/stores/editor/editor-store-provider";

interface EditorStageProps {
  width: number;
  height: number;
  image: HTMLImageElement;
  effectiveScale: number;
  layerX: number;
  layerY: number;
  isDraggable: boolean;
  stagePosition: { x: number; y: number };
  onStagePositionChange: (pos: { x: number; y: number }) => void;
  onWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void;
}

export function EditorStage({
  width,
  height,
  image,
  effectiveScale,
  layerX,
  layerY,
  isDraggable,
  stagePosition,
  onStagePositionChange,
  onWheel,
}: EditorStageProps) {
  const layerRef = useRef<Konva.Layer>(null);

  const steps = useEditorStore((s) => s.steps);
  const selectedStepIndex = useEditorStore((s) => s.selectedStepIndex);
  const selectedHotspotId = useEditorStore((s) => s.selectedHotspotId);
  const selectedAnnotationId = useEditorStore((s) => s.selectedAnnotationId);
  const activeTool = useEditorStore((s) => s.activeTool);
  const selectHotspot = useEditorStore((s) => s.selectHotspot);
  const selectAnnotation = useEditorStore((s) => s.selectAnnotation);
  const updateHotspot = useEditorStore((s) => s.updateHotspot);
  const updateAnnotation = useEditorStore((s) => s.updateAnnotation);

  const { createHotspot, saveHotspot } = useHotspotActions();
  const { createAnnotation, saveAnnotation, deleteAnnotation } = useAnnotationActions();

  const selectedStep = steps[selectedStepIndex];
  const selectedId = selectedHotspotId ?? selectedAnnotationId;

  // Drawing state for hotspot creation
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [drawCurrent, setDrawCurrent] = useState({ x: 0, y: 0 });

  const pointerToImageCoords = useCallback(
    (pointerX: number, pointerY: number) => ({
      x: (pointerX - stagePosition.x - layerX) / effectiveScale,
      y: (pointerY - stagePosition.y - layerY) / effectiveScale,
    }),
    [stagePosition, layerX, layerY, effectiveScale],
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target === e.target.getStage() && activeTool === "select") {
        selectHotspot(null);
        selectAnnotation(null);
      }
    },
    [selectHotspot, selectAnnotation, activeTool],
  );

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawingTool(activeTool)) return;
      if (e.target !== e.target.getStage()) return;

      const stage = e.target.getStage();
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

      const imageCoords = pointerToImageCoords(pointer.x, pointer.y);
      setDrawStart(imageCoords);
      setDrawCurrent(imageCoords);
      setIsDrawing(true);
    },
    [activeTool, pointerToImageCoords],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawing) return;

      const stage = e.target.getStage();
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

      setDrawCurrent(pointerToImageCoords(pointer.x, pointer.y));
    },
    [isDrawing, pointerToImageCoords],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !selectedStep) return;
    setIsDrawing(false);

    // Normalize rect (handle negative drag direction)
    const x = Math.min(drawStart.x, drawCurrent.x);
    const y = Math.min(drawStart.y, drawCurrent.y);
    const w = Math.abs(drawCurrent.x - drawStart.x);
    const h = Math.abs(drawCurrent.y - drawStart.y);

    // Enforce minimum size
    if (w < MIN_DRAW_SIZE || h < MIN_DRAW_SIZE) return;

    const rect = {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(w),
      height: Math.round(h),
    };

    if (activeTool === "hotspot") {
      createHotspot(selectedStep.id, rect);
    } else if (activeTool === "blur" || activeTool === "highlight") {
      createAnnotation(selectedStep.id, activeTool, rect);
    } else if (activeTool === "crop") {
      // Constrain to image aspect ratio during drawing
      const imgRatio = image.naturalWidth / image.naturalHeight;
      const constrainedH = Math.round(rect.width / imgRatio);
      const constrainedRect = {
        ...rect,
        height: constrainedH,
        // Adjust y if user dragged upward
        y: drawCurrent.y < drawStart.y ? Math.round(drawStart.y - constrainedH) : rect.y,
      };

      // One crop per step — remove existing before creating new
      const existingCrop = selectedStep.annotations.find((a) => a.type === "crop");
      if (existingCrop) {
        deleteAnnotation(selectedStep.id, existingCrop.id);
      }
      createAnnotation(selectedStep.id, "crop", constrainedRect);
    }
  }, [isDrawing, selectedStep, drawStart, drawCurrent, activeTool, createHotspot, createAnnotation, deleteAnnotation, image]);

  // Drawing preview rect dimensions (in image space)
  const previewW = Math.abs(drawCurrent.x - drawStart.x);
  const isCropDraw = activeTool === "crop";
  const imgRatio = image.naturalWidth / image.naturalHeight;
  const previewH = isCropDraw ? previewW / imgRatio : Math.abs(drawCurrent.y - drawStart.y);
  const previewX = Math.min(drawStart.x, drawCurrent.x);
  const previewY = isCropDraw
    ? (drawCurrent.y < drawStart.y ? drawStart.y - previewH : drawStart.y)
    : Math.min(drawStart.y, drawCurrent.y);

  const handleHotspotSelect = useCallback(
    (hotspotId: string) => {
      selectHotspot(hotspotId);
    },
    [selectHotspot],
  );

  const handleHotspotDragEnd = useCallback(
    (hotspotId: string, x: number, y: number) => {
      if (!selectedStep) return;
      updateHotspot(selectedStep.id, hotspotId, { x, y });
      saveHotspot(selectedStep.id, hotspotId, { x, y });
    },
    [selectedStep, updateHotspot, saveHotspot],
  );

  const handleHotspotTransformEnd = useCallback(
    (
      hotspotId: string,
      attrs: { x: number; y: number; width: number; height: number },
    ) => {
      if (!selectedStep) return;
      updateHotspot(selectedStep.id, hotspotId, attrs);
      saveHotspot(selectedStep.id, hotspotId, attrs);
    },
    [selectedStep, updateHotspot, saveHotspot],
  );

  const handleAnnotationSelect = useCallback(
    (annotationId: string) => {
      selectAnnotation(annotationId);
    },
    [selectAnnotation],
  );

  const handleAnnotationDragEnd = useCallback(
    (annotationId: string, x: number, y: number) => {
      if (!selectedStep) return;
      updateAnnotation(selectedStep.id, annotationId, { x, y });
      saveAnnotation(selectedStep.id, annotationId, { x, y });
    },
    [selectedStep, updateAnnotation, saveAnnotation],
  );

  const handleAnnotationTransformEnd = useCallback(
    (
      annotationId: string,
      attrs: { x: number; y: number; width: number; height: number },
    ) => {
      if (!selectedStep) return;
      updateAnnotation(selectedStep.id, annotationId, attrs);
      saveAnnotation(selectedStep.id, annotationId, attrs);
    },
    [selectedStep, updateAnnotation, saveAnnotation],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target === e.target.getStage()) {
        onStagePositionChange({ x: e.target.x(), y: e.target.y() });
      }
    },
    [onStagePositionChange],
  );

  // Determine if the selected crop should keep aspect ratio
  const selectedAnnotation = selectedStep?.annotations.find(
    (a) => a.id === selectedAnnotationId,
  );
  const cropKeepRatio =
    selectedAnnotation?.type === "crop" &&
    parseCropSettings(selectedAnnotation.settings).lockAspectRatio;

  const isDrawTool = isDrawingTool(activeTool);
  const cursor = isDrawTool ? "crosshair" : isDraggable ? "grab" : "default";

  if (!selectedStep) return null;

  return (
    <Stage
      width={width}
      height={height}
      draggable={isDraggable && !isDrawTool}
      x={stagePosition.x}
      y={stagePosition.y}
      onClick={handleStageClick}
      onTap={handleStageClick}
      onWheel={onWheel}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor }}
    >
      <Layer
        ref={layerRef}
        x={layerX}
        y={layerY}
        scaleX={effectiveScale}
        scaleY={effectiveScale}
      >
        <StepContent image={image} />
        <CropDimOverlay
          crop={selectedStep.annotations.find((a) => a.type === "crop")}
          imageWidth={image.naturalWidth}
          imageHeight={image.naturalHeight}
        />
        <AnnotationOverlay
          annotations={selectedStep.annotations}
          selectedAnnotationId={selectedAnnotationId}
          activeTool={activeTool}
          onSelect={handleAnnotationSelect}
          onDragEnd={handleAnnotationDragEnd}
          onTransformEnd={handleAnnotationTransformEnd}
        />
        <HotspotOverlay
          hotspots={selectedStep.hotspots}
          selectedHotspotId={selectedHotspotId}
          activeTool={activeTool}
          onSelect={handleHotspotSelect}
          onDragEnd={handleHotspotDragEnd}
          onTransformEnd={handleHotspotTransformEnd}
        />
        <SelectionTransformer
          selectedId={selectedId}
          layerRef={layerRef}
          keepRatio={cropKeepRatio}
        />
        {isDrawing && (
          <Rect
            x={previewX}
            y={previewY}
            width={previewW}
            height={previewH}
            fill={(PREVIEW_COLORS[activeTool] ?? PREVIEW_COLORS.hotspot)!.fill}
            stroke={(PREVIEW_COLORS[activeTool] ?? PREVIEW_COLORS.hotspot)!.stroke}
            strokeWidth={1.5}
            dash={[6, 3]}
            listening={false}
          />
        )}
      </Layer>
    </Stage>
  );
}
