import { ForbiddenError, NotFoundError, ValidationError } from "@porygon/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAnnotationService } from "./annotation.service";

function mockAnnotation(overrides: Record<string, unknown> = {}) {
  return {
    id: "annotation_1",
    stepId: "step_1",
    type: "highlight" as const,
    x: 100,
    y: 200,
    width: 50,
    height: 30,
    settings: {},
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function mockStep(overrides: Record<string, unknown> = {}) {
  return {
    id: "step_1",
    demoId: "demo_1",
    orderIndex: 0,
    screenshotUrl: "https://example.com/screenshot.png",
    actionType: "click" as const,
    actionCoordinates: { x: 100, y: 200 },
    hotspots: [],
    annotations: [],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

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

function createMockRepos() {
  return {
    annotationRepo: {
      create: vi.fn(),
      getById: vi.fn(),
      listByStep: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteByStep: vi.fn(),
    },
    stepRepo: {
      getById: vi.fn(),
    },
    demoRepo: {
      getById: vi.fn(),
    },
    workspaceRepo: {
      getMemberRole: vi.fn(),
    },
  };
}

type MockRepos = ReturnType<typeof createMockRepos>;

const USER_ID = "user_1";

describe("AnnotationService", () => {
  let repos: MockRepos;
  let service: ReturnType<typeof createAnnotationService>;

  beforeEach(() => {
    repos = createMockRepos();
    service = createAnnotationService(
      repos as unknown as Parameters<typeof createAnnotationService>[0],
    );
  });

  // --- create ---
  describe("create", () => {
    it("creates an annotation successfully", async () => {
      const annotation = mockAnnotation();
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.annotationRepo.create.mockResolvedValue(annotation);

      const result = await service.create(
        { stepId: "step_1", type: "highlight", x: 100, y: 200, width: 50, height: 30 },
        USER_ID,
      );

      expect(result).toEqual(annotation);
      expect(repos.annotationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stepId: "step_1",
          type: "highlight",
          x: 100,
          y: 200,
          width: 50,
          height: 30,
        }),
      );
    });

    it("throws NotFoundError when step doesn't exist", async () => {
      repos.stepRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.create(
          { stepId: "nonexistent", type: "blur", x: 10, y: 10, width: 20, height: 20 },
          USER_ID,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError when user is not a workspace member", async () => {
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.create(
          { stepId: "step_1", type: "highlight", x: 10, y: 10, width: 20, height: 20 },
          "stranger",
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("replaces existing crop when creating a new crop on the same step", async () => {
      const existingCrop = mockAnnotation({ id: "crop_1", type: "crop" });
      const newCrop = mockAnnotation({ id: "crop_2", type: "crop", x: 50, y: 50 });
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.annotationRepo.listByStep.mockResolvedValue([existingCrop]);
      repos.annotationRepo.delete.mockResolvedValue(true);
      repos.annotationRepo.create.mockResolvedValue(newCrop);

      const result = await service.create(
        { stepId: "step_1", type: "crop", x: 50, y: 50, width: 200, height: 150 },
        USER_ID,
      );

      expect(result).toEqual(newCrop);
      expect(repos.annotationRepo.delete).toHaveBeenCalledWith("crop_1");
      expect(repos.annotationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: "crop" }),
      );
    });

    it("allows multiple blur/highlight annotations on the same step", async () => {
      const newHighlight = mockAnnotation({ id: "highlight_1", type: "highlight" });
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.annotationRepo.create.mockResolvedValue(newHighlight);

      const result = await service.create(
        { stepId: "step_1", type: "highlight", x: 10, y: 10, width: 50, height: 30 },
        USER_ID,
      );

      expect(result).toEqual(newHighlight);
      // listByStep should NOT be called for non-crop types
      expect(repos.annotationRepo.listByStep).not.toHaveBeenCalled();
      // delete should NOT be called
      expect(repos.annotationRepo.delete).not.toHaveBeenCalled();
    });

    it("validates position — rejects negative values", async () => {
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      await expect(
        service.create(
          { stepId: "step_1", type: "crop", x: -1, y: 10, width: 20, height: 20 },
          USER_ID,
        ),
      ).rejects.toThrow(ValidationError);
    });
  });

  // --- update ---
  describe("update", () => {
    it("updates annotation fields", async () => {
      const annotation = mockAnnotation();
      const updated = mockAnnotation({ x: 150, y: 250 });
      repos.annotationRepo.getById.mockResolvedValue(annotation);
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.annotationRepo.update.mockResolvedValue(updated);

      const result = await service.update(
        "annotation_1",
        { x: 150, y: 250 },
        USER_ID,
      );

      expect(result).toEqual(updated);
      expect(repos.annotationRepo.update).toHaveBeenCalledWith("annotation_1", {
        x: 150,
        y: 250,
      });
    });

    it("throws NotFoundError when annotation doesn't exist", async () => {
      repos.annotationRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.update("nonexistent", { x: 10 }, USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError for non-members", async () => {
      repos.annotationRepo.getById.mockResolvedValue(mockAnnotation());
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.update("annotation_1", { x: 10 }, "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // --- delete ---
  describe("delete", () => {
    it("deletes an annotation", async () => {
      repos.annotationRepo.getById.mockResolvedValue(mockAnnotation());
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.annotationRepo.delete.mockResolvedValue(true);

      const result = await service.delete("annotation_1", USER_ID);

      expect(result).toBe(true);
      expect(repos.annotationRepo.delete).toHaveBeenCalledWith("annotation_1");
    });

    it("throws NotFoundError when annotation doesn't exist", async () => {
      repos.annotationRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.delete("nonexistent", USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError for non-members", async () => {
      repos.annotationRepo.getById.mockResolvedValue(mockAnnotation());
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.delete("annotation_1", "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // --- listByStep ---
  describe("listByStep", () => {
    it("returns annotations for a step", async () => {
      const annotations = [
        mockAnnotation({ id: "annotation_1" }),
        mockAnnotation({ id: "annotation_2", x: 300 }),
      ];
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("editor");
      repos.annotationRepo.listByStep.mockResolvedValue(annotations);

      const result = await service.listByStep("step_1", USER_ID);

      expect(result).toEqual(annotations);
      expect(repos.annotationRepo.listByStep).toHaveBeenCalledWith("step_1");
    });

    it("throws NotFoundError when step doesn't exist", async () => {
      repos.stepRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.listByStep("nonexistent", USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError for non-members", async () => {
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.listByStep("step_1", "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
