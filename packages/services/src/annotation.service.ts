import type { createAnnotationRepository } from "@repo/db";
import type { createDemoRepository } from "@repo/db";
import type { createStepRepository } from "@repo/db";
import type { createWorkspaceRepository } from "@repo/db";
import { ForbiddenError, NotFoundError, ValidationError } from "@repo/shared";

type AnnotationRepo = ReturnType<typeof createAnnotationRepository>;
type StepRepo = ReturnType<typeof createStepRepository>;
type DemoRepo = ReturnType<typeof createDemoRepository>;
type WorkspaceRepo = ReturnType<typeof createWorkspaceRepository>;

interface AnnotationServiceDeps {
  annotationRepo: AnnotationRepo;
  stepRepo: StepRepo;
  demoRepo: DemoRepo;
  workspaceRepo: WorkspaceRepo;
}

export interface CreateAnnotationInput {
  stepId: string;
  type: "blur" | "crop" | "highlight";
  x: number;
  y: number;
  width: number;
  height: number;
  settings?: {
    blurIntensity?: number;
    highlightColor?: string;
    highlightOpacity?: number;
  };
}

export interface UpdateAnnotationInput {
  type?: "blur" | "crop" | "highlight";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  settings?: {
    blurIntensity?: number;
    highlightColor?: string;
    highlightOpacity?: number;
  };
}

export function createAnnotationService({
  annotationRepo,
  stepRepo,
  demoRepo,
  workspaceRepo,
}: AnnotationServiceDeps) {
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

  async function getAnnotationOrThrow(id: string) {
    const annotation = await annotationRepo.getById(id);
    if (!annotation) {
      throw new NotFoundError("Annotation not found");
    }
    return annotation;
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

  return {
    async create(input: CreateAnnotationInput, userId: string) {
      await assertStepAccess(input.stepId, userId);

      validatePosition(input);

      return annotationRepo.create({
        stepId: input.stepId,
        type: input.type,
        x: input.x,
        y: input.y,
        width: input.width,
        height: input.height,
        ...(input.settings !== undefined && { settings: input.settings }),
      });
    },

    async update(id: string, input: UpdateAnnotationInput, userId: string) {
      const annotation = await getAnnotationOrThrow(id);
      await assertStepAccess(annotation.stepId, userId);

      validatePosition(input);

      return annotationRepo.update(id, input);
    },

    async delete(id: string, userId: string) {
      const annotation = await getAnnotationOrThrow(id);
      await assertStepAccess(annotation.stepId, userId);
      return annotationRepo.delete(id);
    },

    async listByStep(stepId: string, userId: string) {
      await assertStepAccess(stepId, userId);
      return annotationRepo.listByStep(stepId);
    },
  };
}
