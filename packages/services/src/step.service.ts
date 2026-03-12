import type { createDemoRepository } from "@repo/db";
import type { createStepRepository } from "@repo/db";
import type { createWorkspaceRepository } from "@repo/db";
import {
  ForbiddenError,
  LimitExceededError,
  NotFoundError,
  ValidationError,
  PLAN_LIMITS,
} from "@repo/shared";
import type { Nullable } from "@repo/shared";

type StepRepo = ReturnType<typeof createStepRepository>;
type DemoRepo = ReturnType<typeof createDemoRepository>;
type WorkspaceRepo = ReturnType<typeof createWorkspaceRepository>;

interface StepServiceDeps {
  stepRepo: StepRepo;
  demoRepo: DemoRepo;
  workspaceRepo: WorkspaceRepo;
}

interface CreateStepInput {
  demoId: string;
  screenshotUrl?: Nullable<string>;
  actionType?: "click" | "scroll" | "type" | "navigation";
  actionCoordinates?: Nullable<Record<string, unknown>>;
}

interface UpdateStepInput {
  screenshotUrl?: Nullable<string>;
  actionType?: Nullable<"click" | "scroll" | "type" | "navigation">;
  actionCoordinates?: Nullable<Record<string, unknown>>;
}

export function createStepService({
  stepRepo,
  demoRepo,
  workspaceRepo,
}: StepServiceDeps) {
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

  async function assertDemoAccess(demoId: string, userId: string) {
    const demo = await getDemoOrThrow(demoId);
    await assertWorkspaceMember(demo.workspaceId, userId);
    return demo;
  }

  async function getStepOrThrow(id: string) {
    const step = await stepRepo.getById(id);
    if (!step) {
      throw new NotFoundError("Step not found");
    }
    return step;
  }

  async function checkStepLimit(demoId: string, workspaceId: string) {
    const workspace = await workspaceRepo.getById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }
    const count = await stepRepo.countByDemo(demoId);
    const limit = PLAN_LIMITS[workspace.plan].maxStepsPerDemo;
    if (limit !== -1 && count >= limit) {
      throw new LimitExceededError(
        `Step limit reached for ${workspace.plan} plan (max ${limit} per demo)`,
      );
    }
  }

  return {
    async create(input: CreateStepInput, userId: string) {
      const demo = await assertDemoAccess(input.demoId, userId);
      await checkStepLimit(demo.id, demo.workspaceId);

      const orderIndex = await stepRepo.countByDemo(demo.id);

      return stepRepo.create({
        demoId: demo.id,
        orderIndex,
        ...(input.screenshotUrl !== undefined && {
          screenshotUrl: input.screenshotUrl,
        }),
        ...(input.actionType !== undefined && {
          actionType: input.actionType,
        }),
        ...(input.actionCoordinates !== undefined && {
          actionCoordinates: input.actionCoordinates,
        }),
      });
    },

    async getById(id: string, userId: string) {
      const step = await getStepOrThrow(id);
      const demo = await getDemoOrThrow(step.demoId);
      await assertWorkspaceMember(demo.workspaceId, userId);
      return step;
    },

    async list(demoId: string, userId: string) {
      await assertDemoAccess(demoId, userId);
      return stepRepo.listByDemo(demoId);
    },

    async update(id: string, input: UpdateStepInput, userId: string) {
      const step = await getStepOrThrow(id);
      await assertDemoAccess(step.demoId, userId);
      return stepRepo.update(id, input);
    },

    async delete(id: string, userId: string) {
      const step = await getStepOrThrow(id);
      await assertDemoAccess(step.demoId, userId);
      const result = await stepRepo.delete(id);

      const remaining = await stepRepo.listByDemo(step.demoId);
      if (remaining.length > 0) {
        await stepRepo.reorder(
          remaining.map((s, i) => ({ id: s.id, orderIndex: i })),
        );
      }

      return result;
    },

    async reorder(demoId: string, orderedIds: string[], userId: string) {
      await assertDemoAccess(demoId, userId);

      const steps = await stepRepo.listByDemo(demoId);
      const demoStepIds = new Set(steps.map((s) => s.id));
      const orderedSet = new Set(orderedIds);

      if (orderedIds.length !== demoStepIds.size) {
        throw new ValidationError(
          "Ordered IDs must include exactly all steps in the demo",
        );
      }

      for (const id of orderedIds) {
        if (!demoStepIds.has(id)) {
          throw new ValidationError(
            `Step ${id} does not belong to this demo`,
          );
        }
      }

      for (const id of demoStepIds) {
        if (!orderedSet.has(id)) {
          throw new ValidationError(
            `Missing step ${id} from ordered IDs`,
          );
        }
      }

      await stepRepo.reorder(
        orderedIds.map((id, i) => ({ id, orderIndex: i })),
      );
    },
  };
}
