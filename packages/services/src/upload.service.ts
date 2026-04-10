import type { createDemoRepository } from "@porygon/db";
import type { createStepRepository } from "@porygon/db";
import type { createWorkspaceRepository } from "@porygon/db";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
  maxSizeForContentType,
} from "@porygon/shared";

import { storageKey } from "./storage.service";

type DemoRepo = ReturnType<typeof createDemoRepository>;
type StepRepo = ReturnType<typeof createStepRepository>;
type WorkspaceRepo = ReturnType<typeof createWorkspaceRepository>;

interface StorageService {
  generateUploadUrl(key: string, contentType?: string): Promise<string>;
  generateDownloadUrl(key: string): string;
}

interface UploadServiceDeps {
  workspaceRepo: WorkspaceRepo;
  demoRepo: DemoRepo;
  stepRepo: StepRepo;
  storageService: StorageService;
}

export interface GenerateUploadUrlInput {
  workspaceId: string;
  demoId: string;
  stepId: string;
  contentType: string;
}

export function createUploadService({
  workspaceRepo,
  demoRepo,
  stepRepo,
  storageService,
}: UploadServiceDeps) {
  async function assertWorkspaceMember(workspaceId: string, userId: string) {
    const role = await workspaceRepo.getMemberRole(workspaceId, userId);
    if (!role) {
      throw new ForbiddenError("You are not a member of this workspace");
    }
    return role;
  }

  return {
    async generateUploadUrl(input: GenerateUploadUrlInput, userId: string) {
      await assertWorkspaceMember(input.workspaceId, userId);

      const demo = await demoRepo.getById(input.demoId);
      if (!demo) {
        throw new NotFoundError("Demo not found");
      }
      if (demo.workspaceId !== input.workspaceId) {
        throw new ValidationError("Demo does not belong to this workspace");
      }

      const step = await stepRepo.getById(input.stepId);
      if (!step) {
        throw new NotFoundError("Step not found");
      }
      if (step.demoId !== input.demoId) {
        throw new ValidationError("Step does not belong to this demo");
      }

      const key = storageKey(
        input.workspaceId,
        input.demoId,
        input.stepId,
        input.contentType,
      );
      const uploadUrl = await storageService.generateUploadUrl(
        key,
        input.contentType,
      );
      const publicUrl = storageService.generateDownloadUrl(key);

      return {
        uploadUrl,
        publicUrl,
        key,
        maxSizeBytes: maxSizeForContentType(input.contentType),
      };
    },
  };
}
