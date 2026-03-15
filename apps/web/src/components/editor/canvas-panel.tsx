"use client";

import type Konva from "konva";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import useImage from "use-image";

import { CanvasToolbar } from "./canvas/canvas-toolbar";
import { ZoomControls } from "./canvas/zoom-controls";

import { useContainerSize } from "@/hooks/editor/use-container-size";
import { isTypingTarget } from "@/lib/editor/keyboard-utils";
import { useEditorStore } from "@/stores/editor/editor-store-provider";

const EditorStage = dynamic(
  () =>
    import("./canvas/editor-stage").then((mod) => ({
      default: mod.EditorStage,
    })),
  { ssr: false },
);

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;
const ZOOM_STEP = 0.25;
const WHEEL_ZOOM_FACTOR = 1.1;

export function CanvasPanel() {
  const steps = useEditorStore((s) => s.steps);
  const selectedStepIndex = useEditorStore((s) => s.selectedStepIndex);
  const selectedStep = steps[selectedStepIndex];

  const { ref: containerRef, size: containerSize } =
    useContainerSize<HTMLDivElement>();

  const [image] = useImage(selectedStep?.screenshotUrl ?? "", "anonymous");

  const [zoomLevel, setZoomLevel] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const prevStepIdRef = useRef<string | null>(null);

  const imageW = image?.naturalWidth ?? 0;
  const imageH = image?.naturalHeight ?? 0;

  const fitScale =
    imageW > 0 && imageH > 0
      ? Math.min(
          containerSize.width / imageW,
          containerSize.height / imageH,
          1,
        )
      : 1;

  const effectiveScale = fitScale * zoomLevel;
  const layerX = (containerSize.width - imageW * effectiveScale) / 2;
  const layerY = (containerSize.height - imageH * effectiveScale) / 2;

  // Reset zoom/pan on step change
  useEffect(() => {
    const currentStepId = selectedStep?.id ?? null;
    if (currentStepId !== prevStepIdRef.current) {
      prevStepIdRef.current = currentStepId;
      setZoomLevel(1);
      setStagePosition({ x: 0, y: 0 });
    }
  }, [selectedStep?.id]);

  // Space key for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e)) return;

      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setIsPanning(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPanning(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const clampZoom = useCallback(
    (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom)),
    [],
  );

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const direction = e.evt.deltaY < 0 ? 1 : -1;
      const newZoom = clampZoom(
        zoomLevel * (direction > 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR),
      );

      if (newZoom === zoomLevel) return;

      const oldScale = fitScale * zoomLevel;
      const newScale = fitScale * newZoom;

      // Zoom toward cursor position
      const mousePointTo = {
        x: (pointer.x - stagePosition.x - layerX) / oldScale,
        y: (pointer.y - stagePosition.y - layerY) / oldScale,
      };

      const newLayerX = (containerSize.width - imageW * newScale) / 2;
      const newLayerY = (containerSize.height - imageH * newScale) / 2;

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale - newLayerX,
        y: pointer.y - mousePointTo.y * newScale - newLayerY,
      };

      setZoomLevel(newZoom);
      setStagePosition(newPos);
    },
    [
      zoomLevel,
      fitScale,
      stagePosition,
      layerX,
      layerY,
      containerSize.width,
      containerSize.height,
      imageW,
      imageH,
      clampZoom,
    ],
  );

  const handleZoomIn = useCallback(() => {
    setZoomLevel((z) => clampZoom(z + ZOOM_STEP));
    setStagePosition({ x: 0, y: 0 });
  }, [clampZoom]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => clampZoom(z - ZOOM_STEP));
    setStagePosition({ x: 0, y: 0 });
  }, [clampZoom]);

  const handleFit = useCallback(() => {
    setZoomLevel(1);
    setStagePosition({ x: 0, y: 0 });
  }, []);

  if (!selectedStep) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">
          No steps in this demo yet
        </p>
      </div>
    );
  }

  if (!selectedStep.screenshotUrl) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="bg-muted flex aspect-video w-full max-w-2xl items-center justify-center rounded-md">
          <p className="text-muted-foreground text-sm">No screenshot</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {containerSize.width > 0 && containerSize.height > 0 && image && (
        <EditorStage
          width={containerSize.width}
          height={containerSize.height}
          image={image}
          effectiveScale={effectiveScale}
          layerX={layerX}
          layerY={layerY}
          isDraggable={isPanning}
          stagePosition={stagePosition}
          onStagePositionChange={setStagePosition}
          onWheel={handleWheel}
        />
      )}
      <CanvasToolbar />
      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFit={handleFit}
      />
    </div>
  );
}
