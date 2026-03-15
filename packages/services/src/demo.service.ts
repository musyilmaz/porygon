import type { createDemoRepository } from "@porygon/db";
import type { createStepRepository } from "@porygon/db";
import type { createWorkspaceRepository } from "@porygon/db";
import {
  ConflictError,
  ForbiddenError,
  LimitExceededError,
  NotFoundError,
  PLAN_LIMITS,
  ValidationError,
} from "@porygon/shared";
import type { DemoSettings, Nullable } from "@porygon/shared";
import { generateSlug } from "@porygon/shared/utils";

type DemoRepo = ReturnType<typeof createDemoRepository>;
type WorkspaceRepo = ReturnType<typeof createWorkspaceRepository>;
type StepRepo = ReturnType<typeof createStepRepository>;

interface DemoServiceDeps {
  demoRepo: DemoRepo;
  workspaceRepo: WorkspaceRepo;
  stepRepo: StepRepo;
}

export interface CreateDemoInput {
  workspaceId: string;
  title: string;
  description?: Nullable<string>;
  settings?: DemoSettings;
}

export interface UpdateDemoInput {
  title?: string;
  description?: Nullable<string>;
  settings?: DemoSettings;
}

export interface ListDemosOptions {
  limit?: number;
  offset?: number;
  status?: "draft" | "published" | "archived";
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

const SUFFIX_LENGTH = 4;
const MAX_SLUG_ATTEMPTS = 3;

function randomSuffix(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function createDemoService({
  demoRepo,
  workspaceRepo,
  stepRepo,
}: DemoServiceDeps) {
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

  async function assertDemoAccess(id: string, userId: string) {
    const demo = await getDemoOrThrow(id);
    await assertWorkspaceMember(demo.workspaceId, userId);
    return demo;
  }

  async function checkPlanLimit(workspaceId: string) {
    const workspace = await workspaceRepo.getById(workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }
    const count = await demoRepo.countByWorkspace(workspaceId);
    const limit = PLAN_LIMITS[workspace.plan].maxDemos;
    if (limit !== -1 && count >= limit) {
      throw new LimitExceededError(
        `Demo limit reached for ${workspace.plan} plan (max ${limit})`,
      );
    }
  }

  async function uniqueSlug(workspaceId: string, base: string) {
    let slug = base;

    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const existing = await demoRepo.getBySlug(workspaceId, slug);
      if (!existing) return slug;
      slug = `${base}-${randomSuffix()}`;
    }

    throw new ConflictError(
      "Unable to generate a unique slug. Please try a different title.",
    );
  }

  return {
    async create(input: CreateDemoInput, userId: string) {
      await assertWorkspaceMember(input.workspaceId, userId);
      await checkPlanLimit(input.workspaceId);

      const baseSlug = generateSlug(input.title);
      const slug = await uniqueSlug(input.workspaceId, baseSlug);

      return demoRepo.create({
        workspaceId: input.workspaceId,
        title: input.title,
        slug,
        createdBy: userId,
        ...(input.description !== undefined && { description: input.description }),
        ...(input.settings !== undefined && { settings: input.settings }),
      });
    },

    async getById(id: string, userId: string) {
      return assertDemoAccess(id, userId);
    },

    async list(workspaceId: string, userId: string, opts?: ListDemosOptions) {
      await assertWorkspaceMember(workspaceId, userId);
      return demoRepo.listByWorkspace(workspaceId, opts);
    },

    async update(id: string, input: UpdateDemoInput, userId: string) {
      const demo = await assertDemoAccess(id, userId);
      return demoRepo.update(demo.id, input);
    },

    async delete(id: string, userId: string) {
      const demo = await assertDemoAccess(id, userId);
      return demoRepo.delete(demo.id);
    },

    async publish(id: string, userId: string) {
      const demo = await assertDemoAccess(id, userId);
      const stepCount = await stepRepo.countByDemo(demo.id);
      if (stepCount === 0) {
        throw new ValidationError(
          "Cannot publish a demo with no steps",
        );
      }
      return demoRepo.updateStatus(demo.id, "published");
    },

    async unpublish(id: string, userId: string) {
      const demo = await assertDemoAccess(id, userId);
      if (demo.status !== "published") {
        throw new ValidationError("Demo is not currently published");
      }
      return demoRepo.updateStatus(demo.id, "draft");
    },

    async archive(id: string, userId: string) {
      const demo = await assertDemoAccess(id, userId);
      return demoRepo.updateStatus(demo.id, "archived");
    },

    async duplicate(id: string, userId: string) {
      const demo = await assertDemoAccess(id, userId);
      await checkPlanLimit(demo.workspaceId);

      const newTitle = `${demo.title} (copy)`;
      const baseSlug = generateSlug(newTitle);
      const slug = await uniqueSlug(demo.workspaceId, baseSlug);

      const newDemo = await demoRepo.create({
        workspaceId: demo.workspaceId,
        title: newTitle,
        slug,
        createdBy: userId,
        description: demo.description,
        ...(demo.settings != null && { settings: demo.settings }),
      });

      const steps = await stepRepo.listByDemo(demo.id);
      for (const step of steps) {
        await stepRepo.create({
          demoId: newDemo.id,
          orderIndex: step.orderIndex,
          ...(step.screenshotUrl != null && { screenshotUrl: step.screenshotUrl }),
          ...(step.actionType != null && { actionType: step.actionType }),
          ...(step.actionCoordinates != null && {
            actionCoordinates: step.actionCoordinates,
          }),
        });
      }

      return newDemo;
    },
  };
}
