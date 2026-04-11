import type { createDemoRepository } from "@porygon/db";
import type { createHotspotRepository } from "@porygon/db";
import type { createStepRepository } from "@porygon/db";
import type { createWorkspaceRepository } from "@porygon/db";
import { ForbiddenError, NotFoundError, ValidationError } from "@porygon/shared";
import type { HotspotStyle, HotspotType, Nullable, TooltipPosition } from "@porygon/shared";

type HotspotRepo = ReturnType<typeof createHotspotRepository>;
type StepRepo = ReturnType<typeof createStepRepository>;
type DemoRepo = ReturnType<typeof createDemoRepository>;
type WorkspaceRepo = ReturnType<typeof createWorkspaceRepository>;

interface HotspotServiceDeps {
  hotspotRepo: HotspotRepo;
  stepRepo: StepRepo;
  demoRepo: DemoRepo;
  workspaceRepo: WorkspaceRepo;
}

export interface CreateHotspotInput {
  stepId: string;
  type?: HotspotType;
  x: number;
  y: number;
  width: number;
  height: number;
  targetStepId?: Nullable<string>;
  tooltipContent?: Nullable<Record<string, unknown>>;
  tooltipPosition?: TooltipPosition;
  style?: HotspotStyle;
  openByDefault?: boolean;
}

export interface UpdateHotspotInput {
  type?: HotspotType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  targetStepId?: Nullable<string>;
  tooltipContent?: Nullable<Record<string, unknown>>;
  tooltipPosition?: TooltipPosition;
  style?: HotspotStyle;
  openByDefault?: boolean;
}

export function createHotspotService({
  hotspotRepo,
  stepRepo,
  demoRepo,
  workspaceRepo,
}: HotspotServiceDeps) {
  async function assertWorkspaceMember(workspaceId: string, userId: string) {
    const role = await workspaceRepo.getMemberRole(workspaceId, userId);
    if (!role) {
      throw new ForbiddenError("You are not a member of this workspace");
    }
    return role;
  }

  async function getDemoOrThrow(id: string) {
    const demo = await demoRepo.getById(id);
    if (!demo) {
      throw new NotFoundError("Demo not found");
    }
    return demo;
  }

  async function getStepOrThrow(id: string) {
    const step = await stepRepo.getById(id);
    if (!step) {
      throw new NotFoundError("Step not found");
    }
    return step;
  }

  async function getHotspotOrThrow(id: string) {
    const hotspot = await hotspotRepo.getById(id);
    if (!hotspot) {
      throw new NotFoundError("Hotspot not found");
    }
    return hotspot;
  }

  async function assertStepAccess(stepId: string, userId: string) {
    const step = await getStepOrThrow(stepId);
    const demo = await getDemoOrThrow(step.demoId);
    await assertWorkspaceMember(demo.workspaceId, userId);
    return { step, demo };
  }

  function validatePosition(input: { x?: number; y?: number; width?: number; height?: number }) {
    for (const field of ["x", "y", "width", "height"] as const) {
      const value = input[field];
      if (value !== undefined && value < 0) {
        throw new ValidationError(`${field} must be non-negative`);
      }
    }
  }

  async function validateTargetStep(targetStepId: string, demoId: string) {
    const targetStep = await stepRepo.getById(targetStepId);
    if (!targetStep) {
      throw new NotFoundError("Target step not found");
    }
    if (targetStep.demoId !== demoId) {
      throw new ValidationError("Target step must belong to the same demo");
    }
  }

  return {
    async create(input: CreateHotspotInput, userId: string) {
      const { demo } = await assertStepAccess(input.stepId, userId);

      validatePosition(input);

      if (input.targetStepId) {
        await validateTargetStep(input.targetStepId, demo.id);
      }

      return hotspotRepo.create({
        stepId: input.stepId,
        x: input.x,
        y: input.y,
        width: input.width,
        height: input.height,
        ...(input.type !== undefined && { type: input.type }),
        ...(input.targetStepId !== undefined && { targetStepId: input.targetStepId }),
        ...(input.tooltipContent !== undefined && { tooltipContent: input.tooltipContent }),
        ...(input.tooltipPosition !== undefined && { tooltipPosition: input.tooltipPosition }),
        ...(input.style !== undefined && { style: input.style }),
        ...(input.openByDefault !== undefined && { openByDefault: input.openByDefault }),
      });
    },

    async update(id: string, input: UpdateHotspotInput, userId: string) {
      const hotspot = await getHotspotOrThrow(id);
      const { demo } = await assertStepAccess(hotspot.stepId, userId);

      validatePosition(input);

      if (input.targetStepId) {
        await validateTargetStep(input.targetStepId, demo.id);
      }

      return hotspotRepo.update(id, input);
    },

    async delete(id: string, userId: string) {
      const hotspot = await getHotspotOrThrow(id);
      await assertStepAccess(hotspot.stepId, userId);
      return hotspotRepo.delete(id);
    },

    async listByStep(stepId: string, userId: string) {
      await assertStepAccess(stepId, userId);
      return hotspotRepo.listByStep(stepId);
    },
  };
}
