import {
  ForbiddenError,
  LimitExceededError,
  NotFoundError,
  ValidationError,
} from "@porygon/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createStepService } from "./step.service";

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

function mockWorkspace(overrides: Record<string, unknown> = {}) {
  return {
    id: "ws_1",
    name: "Test Workspace",
    slug: "test-workspace",
    plan: "free" as const,
    ownerId: "user_1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function createMockRepos() {
  return {
    stepRepo: {
      create: vi.fn(),
      getById: vi.fn(),
      listByDemo: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      reorder: vi.fn(),
      countByDemo: vi.fn(),
    },
    demoRepo: {
      getById: vi.fn(),
    },
    workspaceRepo: {
      getById: vi.fn(),
      getMemberRole: vi.fn(),
    },
    hotspotRepo: {
      create: vi.fn(),
    },
    annotationRepo: {
      create: vi.fn(),
    },
  };
}

type MockRepos = ReturnType<typeof createMockRepos>;

const USER_ID = "user_1";

describe("StepService", () => {
  let repos: MockRepos;
  let service: ReturnType<typeof createStepService>;

  beforeEach(() => {
    repos = createMockRepos();
    service = createStepService(
      repos as unknown as Parameters<typeof createStepService>[0],
    );
  });

  // --- create ---
  describe("create", () => {
    it("creates a step at the end of the demo", async () => {
      const step = mockStep();
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.stepRepo.countByDemo.mockResolvedValue(3);
      repos.stepRepo.create.mockResolvedValue(step);

      const result = await service.create(
        { demoId: "demo_1", screenshotUrl: "https://example.com/s.png" },
        USER_ID,
      );

      expect(result).toEqual(step);
      expect(repos.stepRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          demoId: "demo_1",
          orderIndex: 3,
          screenshotUrl: "https://example.com/s.png",
        }),
      );
    });

    it("creates the first step with orderIndex 0", async () => {
      const step = mockStep({ orderIndex: 0 });
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.stepRepo.countByDemo.mockResolvedValue(0);
      repos.stepRepo.create.mockResolvedValue(step);

      await service.create({ demoId: "demo_1" }, USER_ID);

      expect(repos.stepRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ orderIndex: 0 }),
      );
    });

    it("throws LimitExceededError when step limit reached (free plan)", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ plan: "free" }));
      repos.stepRepo.countByDemo.mockResolvedValue(25);

      await expect(
        service.create({ demoId: "demo_1" }, USER_ID),
      ).rejects.toThrow(LimitExceededError);
    });

    it("does not enforce limit for business plan (unlimited)", async () => {
      const step = mockStep();
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ plan: "business" }));
      repos.stepRepo.countByDemo.mockResolvedValue(9999);
      repos.stepRepo.create.mockResolvedValue(step);

      const result = await service.create({ demoId: "demo_1" }, USER_ID);

      expect(result).toEqual(step);
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.create({ demoId: "demo_1" }, "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.create({ demoId: "nonexistent" }, USER_ID),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // --- getById ---
  describe("getById", () => {
    it("returns the step when user has access", async () => {
      const step = mockStep();
      repos.stepRepo.getById.mockResolvedValue(step);
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      const result = await service.getById("step_1", USER_ID);

      expect(result).toEqual(step);
    });

    it("throws NotFoundError when step does not exist", async () => {
      repos.stepRepo.getById.mockResolvedValue(undefined);

      await expect(service.getById("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(service.getById("step_1", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.getById("step_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // --- list ---
  describe("list", () => {
    it("returns steps for a demo", async () => {
      const steps = [
        mockStep({ id: "step_1", orderIndex: 0 }),
        mockStep({ id: "step_2", orderIndex: 1 }),
      ];
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("editor");
      repos.stepRepo.listByDemo.mockResolvedValue(steps);

      const result = await service.list("demo_1", USER_ID);

      expect(result).toEqual(steps);
      expect(repos.stepRepo.listByDemo).toHaveBeenCalledWith("demo_1");
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.list("demo_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(service.list("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  // --- update ---
  describe("update", () => {
    it("updates the step", async () => {
      const step = mockStep();
      const updated = mockStep({ screenshotUrl: "https://example.com/new.png" });
      repos.stepRepo.getById.mockResolvedValue(step);
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.stepRepo.update.mockResolvedValue(updated);

      const result = await service.update(
        "step_1",
        { screenshotUrl: "https://example.com/new.png" },
        USER_ID,
      );

      expect(result).toEqual(updated);
      expect(repos.stepRepo.update).toHaveBeenCalledWith("step_1", {
        screenshotUrl: "https://example.com/new.png",
      });
    });

    it("throws NotFoundError when step does not exist", async () => {
      repos.stepRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.update("nonexistent", { screenshotUrl: "x" }, USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.update("step_1", { screenshotUrl: "x" }, "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // --- delete ---
  describe("delete", () => {
    it("deletes the step and reorders remaining", async () => {
      const step = mockStep({ id: "step_2", orderIndex: 1 });
      const remaining = [
        mockStep({ id: "step_1", orderIndex: 0 }),
        mockStep({ id: "step_3", orderIndex: 2 }),
      ];
      repos.stepRepo.getById.mockResolvedValue(step);
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.stepRepo.delete.mockResolvedValue(true);
      repos.stepRepo.listByDemo.mockResolvedValue(remaining);
      repos.stepRepo.reorder.mockResolvedValue(undefined);

      const result = await service.delete("step_2", USER_ID);

      expect(result).toBe(true);
      expect(repos.stepRepo.delete).toHaveBeenCalledWith("step_2");
      expect(repos.stepRepo.reorder).toHaveBeenCalledWith([
        { id: "step_1", orderIndex: 0 },
        { id: "step_3", orderIndex: 1 },
      ]);
    });

    it("deletes the last step without reordering", async () => {
      const step = mockStep();
      repos.stepRepo.getById.mockResolvedValue(step);
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.stepRepo.delete.mockResolvedValue(true);
      repos.stepRepo.listByDemo.mockResolvedValue([]);

      await service.delete("step_1", USER_ID);

      expect(repos.stepRepo.reorder).not.toHaveBeenCalled();
    });

    it("throws NotFoundError when step does not exist", async () => {
      repos.stepRepo.getById.mockResolvedValue(undefined);

      await expect(service.delete("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.delete("step_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // --- reorder ---
  describe("reorder", () => {
    it("reorders steps successfully", async () => {
      const steps = [
        mockStep({ id: "step_1", orderIndex: 0 }),
        mockStep({ id: "step_2", orderIndex: 1 }),
        mockStep({ id: "step_3", orderIndex: 2 }),
      ];
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.stepRepo.listByDemo.mockResolvedValue(steps);
      repos.stepRepo.reorder.mockResolvedValue(undefined);

      await service.reorder(
        "demo_1",
        ["step_3", "step_1", "step_2"],
        USER_ID,
      );

      expect(repos.stepRepo.reorder).toHaveBeenCalledWith([
        { id: "step_3", orderIndex: 0 },
        { id: "step_1", orderIndex: 1 },
        { id: "step_2", orderIndex: 2 },
      ]);
    });

    it("throws ValidationError when IDs contain an extra step", async () => {
      const steps = [
        mockStep({ id: "step_1", orderIndex: 0 }),
        mockStep({ id: "step_2", orderIndex: 1 }),
      ];
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.stepRepo.listByDemo.mockResolvedValue(steps);

      await expect(
        service.reorder("demo_1", ["step_1", "step_2", "step_99"], USER_ID),
      ).rejects.toThrow(ValidationError);
    });

    it("throws ValidationError when IDs are missing a step", async () => {
      const steps = [
        mockStep({ id: "step_1", orderIndex: 0 }),
        mockStep({ id: "step_2", orderIndex: 1 }),
        mockStep({ id: "step_3", orderIndex: 2 }),
      ];
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.stepRepo.listByDemo.mockResolvedValue(steps);

      await expect(
        service.reorder("demo_1", ["step_1", "step_3"], USER_ID),
      ).rejects.toThrow(ValidationError);
    });

    it("throws ValidationError when IDs include a step from another demo", async () => {
      const steps = [
        mockStep({ id: "step_1", orderIndex: 0 }),
        mockStep({ id: "step_2", orderIndex: 1 }),
      ];
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.stepRepo.listByDemo.mockResolvedValue(steps);

      await expect(
        service.reorder("demo_1", ["step_1", "step_foreign"], USER_ID),
      ).rejects.toThrow(ValidationError);
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.reorder("demo_1", ["step_1"], "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.reorder("nonexistent", ["step_1"], USER_ID),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // --- duplicate ---
  describe("duplicate", () => {
    it("copies step with hotspots and annotations", async () => {
      const hotspot = {
        id: "hs_1",
        stepId: "step_1",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        targetStepId: null,
        tooltipContent: { text: "Click here" },
        tooltipPosition: "top" as const,
        style: "default" as const,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };
      const annotation = {
        id: "ann_1",
        stepId: "step_1",
        type: "highlight" as const,
        x: 5,
        y: 15,
        width: 200,
        height: 80,
        settings: { color: "#ff0" },
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };
      const source = mockStep({
        hotspots: [hotspot],
        annotations: [annotation],
        actionCoordinates: { x: 100, y: 200 },
      });
      const newStep = {
        id: "step_new",
        demoId: "demo_1",
        orderIndex: 1,
        screenshotUrl: source.screenshotUrl,
        actionType: source.actionType,
        actionCoordinates: source.actionCoordinates,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const newHotspot = { ...hotspot, id: "hs_new", stepId: "step_new" };
      const newAnnotation = { ...annotation, id: "ann_new", stepId: "step_new" };

      repos.stepRepo.getById.mockResolvedValue(source);
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.stepRepo.countByDemo.mockResolvedValue(1);
      repos.stepRepo.create.mockResolvedValue(newStep);
      repos.hotspotRepo.create.mockResolvedValue(newHotspot);
      repos.annotationRepo.create.mockResolvedValue(newAnnotation);

      const result = await service.duplicate("step_1", USER_ID);

      expect(result).toEqual({
        ...newStep,
        hotspots: [newHotspot],
        annotations: [newAnnotation],
      });
      expect(repos.stepRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          demoId: "demo_1",
          orderIndex: 1,
          screenshotUrl: source.screenshotUrl,
          actionType: source.actionType,
          actionCoordinates: source.actionCoordinates,
        }),
      );
      expect(repos.hotspotRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stepId: "step_new",
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          tooltipContent: { text: "Click here" },
          tooltipPosition: "top",
          style: "default",
        }),
      );
      expect(repos.annotationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stepId: "step_new",
          type: "highlight",
          x: 5,
          y: 15,
          width: 200,
          height: 80,
          settings: { color: "#ff0" },
        }),
      );
    });

    it("works with step that has no hotspots or annotations", async () => {
      const source = mockStep({ hotspots: [], annotations: [] });
      const newStep = {
        id: "step_new",
        demoId: "demo_1",
        orderIndex: 1,
        screenshotUrl: source.screenshotUrl,
        actionType: source.actionType,
        actionCoordinates: source.actionCoordinates,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repos.stepRepo.getById.mockResolvedValue(source);
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.stepRepo.countByDemo.mockResolvedValue(1);
      repos.stepRepo.create.mockResolvedValue(newStep);

      const result = await service.duplicate("step_1", USER_ID);

      expect(result).toEqual({
        ...newStep,
        hotspots: [],
        annotations: [],
      });
      expect(repos.hotspotRepo.create).not.toHaveBeenCalled();
      expect(repos.annotationRepo.create).not.toHaveBeenCalled();
    });

    it("respects step limit", async () => {
      const source = mockStep();
      repos.stepRepo.getById.mockResolvedValue(source);
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ plan: "free" }));
      repos.stepRepo.countByDemo.mockResolvedValue(25);

      await expect(service.duplicate("step_1", USER_ID)).rejects.toThrow(
        LimitExceededError,
      );
    });

    it("throws NotFoundError when step does not exist", async () => {
      repos.stepRepo.getById.mockResolvedValue(undefined);

      await expect(service.duplicate("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.duplicate("step_1", "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
