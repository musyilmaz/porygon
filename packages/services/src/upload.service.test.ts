import {
  ForbiddenError,
  MAX_UPLOAD_SIZE_BYTES,
  NotFoundError,
  ValidationError,
} from "@repo/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUploadService } from "./upload.service";

function mockDemo(overrides: Record<string, unknown> = {}) {
  return {
    id: "demo_1",
    workspaceId: "ws_1",
    title: "My Demo",
    description: null,
    slug: "my-demo",
    status: "draft" as const,
    settings: {},
    createdBy: "user_1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    publishedAt: null,
    ...overrides,
  };
}

function mockStep(overrides: Record<string, unknown> = {}) {
  return {
    id: "step_1",
    demoId: "demo_1",
    orderIndex: 0,
    screenshotUrl: null,
    actionType: "click" as const,
    actionCoordinates: null,
    hotspots: [],
    annotations: [],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function createMockDeps() {
  return {
    workspaceRepo: {
      getMemberRole: vi.fn(),
    },
    demoRepo: {
      getById: vi.fn(),
    },
    stepRepo: {
      getById: vi.fn(),
    },
    storageService: {
      generateUploadUrl: vi.fn(),
      generateDownloadUrl: vi.fn(),
    },
  };
}

type MockDeps = ReturnType<typeof createMockDeps>;

const USER_ID = "user_1";

const VALID_INPUT = {
  workspaceId: "ws_1",
  demoId: "demo_1",
  stepId: "step_1",
  contentType: "image/webp",
};

describe("UploadService", () => {
  let deps: MockDeps;
  let service: ReturnType<typeof createUploadService>;

  beforeEach(() => {
    deps = createMockDeps();
    service = createUploadService(
      deps as unknown as Parameters<typeof createUploadService>[0],
    );
  });

  // --- generateUploadUrl ---
  describe("generateUploadUrl", () => {
    it("returns upload URL, public URL, key, and maxSizeBytes", async () => {
      deps.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      deps.demoRepo.getById.mockResolvedValue(mockDemo());
      deps.stepRepo.getById.mockResolvedValue(mockStep());
      deps.storageService.generateUploadUrl.mockResolvedValue(
        "https://r2.example.com/presigned",
      );
      deps.storageService.generateDownloadUrl.mockReturnValue(
        "https://cdn.example.com/ws_1/demo_1/step_1.webp",
      );

      const result = await service.generateUploadUrl(VALID_INPUT, USER_ID);

      expect(result).toEqual({
        uploadUrl: "https://r2.example.com/presigned",
        publicUrl: "https://cdn.example.com/ws_1/demo_1/step_1.webp",
        key: "ws_1/demo_1/step_1.webp",
        maxSizeBytes: MAX_UPLOAD_SIZE_BYTES,
      });
    });

    it("forwards content type to storage service", async () => {
      deps.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      deps.demoRepo.getById.mockResolvedValue(mockDemo());
      deps.stepRepo.getById.mockResolvedValue(mockStep());
      deps.storageService.generateUploadUrl.mockResolvedValue("https://r2.example.com");
      deps.storageService.generateDownloadUrl.mockReturnValue("https://cdn.example.com");

      await service.generateUploadUrl(
        { ...VALID_INPUT, contentType: "image/png" },
        USER_ID,
      );

      expect(deps.storageService.generateUploadUrl).toHaveBeenCalledWith(
        "ws_1/demo_1/step_1.webp",
        "image/png",
      );
    });

    it("generates correct storage key", async () => {
      deps.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      deps.demoRepo.getById.mockResolvedValue(mockDemo());
      deps.stepRepo.getById.mockResolvedValue(mockStep());
      deps.storageService.generateUploadUrl.mockResolvedValue("https://r2.example.com");
      deps.storageService.generateDownloadUrl.mockReturnValue("https://cdn.example.com");

      await service.generateUploadUrl(VALID_INPUT, USER_ID);

      expect(deps.storageService.generateUploadUrl).toHaveBeenCalledWith(
        "ws_1/demo_1/step_1.webp",
        "image/webp",
      );
      expect(deps.storageService.generateDownloadUrl).toHaveBeenCalledWith(
        "ws_1/demo_1/step_1.webp",
      );
    });

    it("throws ForbiddenError when user is not a workspace member", async () => {
      deps.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.generateUploadUrl(VALID_INPUT, "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError when demo does not exist", async () => {
      deps.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      deps.demoRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.generateUploadUrl(VALID_INPUT, USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ValidationError when demo does not belong to workspace", async () => {
      deps.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      deps.demoRepo.getById.mockResolvedValue(
        mockDemo({ workspaceId: "ws_other" }),
      );

      await expect(
        service.generateUploadUrl(VALID_INPUT, USER_ID),
      ).rejects.toThrow(ValidationError);
    });

    it("throws NotFoundError when step does not exist", async () => {
      deps.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      deps.demoRepo.getById.mockResolvedValue(mockDemo());
      deps.stepRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.generateUploadUrl(VALID_INPUT, USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ValidationError when step does not belong to demo", async () => {
      deps.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      deps.demoRepo.getById.mockResolvedValue(mockDemo());
      deps.stepRepo.getById.mockResolvedValue(
        mockStep({ demoId: "demo_other" }),
      );

      await expect(
        service.generateUploadUrl(VALID_INPUT, USER_ID),
      ).rejects.toThrow(ValidationError);
    });
  });
});
