import type { createDemoRepository } from "@porygon/db";
import { NotFoundError } from "@porygon/shared";

type DemoRepo = ReturnType<typeof createDemoRepository>;

interface PublicDemoServiceDeps {
  demoRepo: DemoRepo;
}

export function createPublicDemoService({ demoRepo }: PublicDemoServiceDeps) {
  return {
    async getBySlug(slug: string) {
      const demo = await demoRepo.getPublishedBySlug(slug);
      if (!demo) {
        throw new NotFoundError("Demo not found");
      }

      return {
        id: demo.id,
        title: demo.title,
        description: demo.description,
        slug: demo.slug,
        settings: demo.settings,
        publishedAt: demo.publishedAt,
        steps: demo.steps.map((step) => ({
          id: step.id,
          orderIndex: step.orderIndex,
          screenshotUrl: step.screenshotUrl,
          actionType: step.actionType,
          actionCoordinates: step.actionCoordinates,
          hotspots: step.hotspots.map((hotspot) => ({
            id: hotspot.id,
            x: hotspot.x,
            y: hotspot.y,
            width: hotspot.width,
            height: hotspot.height,
            targetStepId: hotspot.targetStepId,
            tooltipContent: hotspot.tooltipContent,
            tooltipPosition: hotspot.tooltipPosition,
            style: hotspot.style,
          })),
          annotations: step.annotations.map((annotation) => ({
            id: annotation.id,
            type: annotation.type,
            x: annotation.x,
            y: annotation.y,
            width: annotation.width,
            height: annotation.height,
            settings: annotation.settings,
          })),
        })),
      };
    },
  };
}
