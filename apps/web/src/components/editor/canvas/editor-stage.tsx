import type Konva from "konva";
import { useCallback, useRef } from "react";
import { Layer, Stage } from "react-konva";

import { AnnotationOverlay } from "./annotation-overlay";
import { HotspotOverlay } from "./hotspot-overlay";
import { SelectionTransformer } from "./selection-transformer";
import { StepContent } from "./step-content";

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

  const selectedStep = steps[selectedStepIndex];
  const selectedId = selectedHotspotId ?? selectedAnnotationId;

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target === e.target.getStage()) {
        selectHotspot(null);
        selectAnnotation(null);
      }
    },
    [selectHotspot, selectAnnotation],
  );

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
    },
    [selectedStep, updateHotspot],
  );

  const handleHotspotTransformEnd = useCallback(
    (
      hotspotId: string,
      attrs: { x: number; y: number; width: number; height: number },
    ) => {
      if (!selectedStep) return;
      updateHotspot(selectedStep.id, hotspotId, attrs);
    },
    [selectedStep, updateHotspot],
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
    },
    [selectedStep, updateAnnotation],
  );

  const handleAnnotationTransformEnd = useCallback(
    (
      annotationId: string,
      attrs: { x: number; y: number; width: number; height: number },
    ) => {
      if (!selectedStep) return;
      updateAnnotation(selectedStep.id, annotationId, attrs);
    },
    [selectedStep, updateAnnotation],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target === e.target.getStage()) {
        onStagePositionChange({ x: e.target.x(), y: e.target.y() });
      }
    },
    [onStagePositionChange],
  );

  if (!selectedStep) return null;

  return (
    <Stage
      width={width}
      height={height}
      draggable={isDraggable}
      x={stagePosition.x}
      y={stagePosition.y}
      onClick={handleStageClick}
      onTap={handleStageClick}
      onWheel={onWheel}
      onDragEnd={handleDragEnd}
      style={{ cursor: isDraggable ? "grab" : "default" }}
    >
      <Layer
        ref={layerRef}
        x={layerX}
        y={layerY}
        scaleX={effectiveScale}
        scaleY={effectiveScale}
      >
        <StepContent image={image} />
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
        />
      </Layer>
    </Stage>
  );
}
