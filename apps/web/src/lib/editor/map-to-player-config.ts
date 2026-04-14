import type {
  PlayerAnnotation,
  PlayerConfig,
  PlayerHotspot,
  PlayerStep,
} from "@porygon/player";

import type { EditorDemo, EditorStep } from "@/stores/editor/types";

function mapHotspot(h: EditorStep["hotspots"][number]): PlayerHotspot {
  return {
    id: h.id,
    x: h.x,
    y: h.y,
    width: h.width,
    height: h.height,
    targetStepId: h.targetStepId,
    tooltipContent: h.tooltipContent,
    tooltipPosition: h.tooltipPosition,
    style: h.style ?? {},
  };
}

function mapAnnotation(
  a: EditorStep["annotations"][number],
): PlayerAnnotation {
  return {
    id: a.id,
    type: a.type,
    x: a.x,
    y: a.y,
    width: a.width,
    height: a.height,
    settings: a.settings ?? {},
  };
}

function hasMedia(step: EditorStep): boolean {
  return (
    step.screenshotUrl !== null ||
    (step.mediaType === "video" && step.videoUrl !== null)
  );
}

function mapStep(step: EditorStep): PlayerStep {
  return {
    id: step.id,
    orderIndex: step.orderIndex,
    screenshotUrl: step.screenshotUrl ?? "",
    actionType: step.actionType ?? "click",
    actionCoordinates: step.actionCoordinates,
    hotspots: step.hotspots.map(mapHotspot),
    annotations: step.annotations.map(mapAnnotation),
  };
}

export function mapToPlayerConfig(
  demoId: string,
  demo: EditorDemo,
  steps: EditorStep[],
): PlayerConfig {
  return {
    id: demoId,
    title: demo.title,
    description: demo.description,
    slug: demo.slug,
    settings: demo.settings ?? {},
    steps: steps.filter(hasMedia).map(mapStep),
  };
}
