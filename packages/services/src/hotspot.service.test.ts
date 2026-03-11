import { ForbiddenError, NotFoundError, ValidationError } from "@repo/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHotspotService } from "./hotspot.service";

function mockHotspot(overrides: Record<string, unknown> = {}) {
  return {
    id: "hotspot_1",
    stepId: "step_1",
    x: 100,
    y: 200,
    width: 50,
    height: 30,
    targetStepId: null,
    tooltipContent: null,
    tooltipPosition: "top",
    style: {},
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
    hotspotRepo: {
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

describe("HotspotService", () => {
  let repos: MockRepos;
  let service: ReturnType<typeof createHotspotService>;

  beforeEach(() => {
    repos = createMockRepos();
    service = createHotspotService(
      repos as unknown as Parameters<typeof createHotspotService>[0],
    );
  });

  // --- create ---
  describe("create", () => {
    it("creates a hotspot successfully", async () => {
      const hotspot = mockHotspot();
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.hotspotRepo.create.mockResolvedValue(hotspot);

      const result = await service.create(
        { stepId: "step_1", x: 100, y: 200, width: 50, height: 30 },
        USER_ID,
      );

      expect(result).toEqual(hotspot);
      expect(repos.hotspotRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stepId: "step_1",
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
          { stepId: "nonexistent", x: 10, y: 10, width: 20, height: 20 },
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
          { stepId: "step_1", x: 10, y: 10, width: 20, height: 20 },
          "stranger",
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("validates branching — targetStepId must belong to same demo", async () => {
      repos.stepRepo.getById
        .mockResolvedValueOnce(mockStep()) // step lookup
        .mockResolvedValueOnce(mockStep({ id: "step_other", demoId: "demo_other" })); // target step lookup
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      await expect(
        service.create(
          {
            stepId: "step_1",
            x: 10,
            y: 10,
            width: 20,
            height: 20,
            targetStepId: "step_other",
          },
          USER_ID,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("throws NotFoundError when targetStepId doesn't exist", async () => {
      repos.stepRepo.getById
        .mockResolvedValueOnce(mockStep()) // step lookup
        .mockResolvedValueOnce(undefined); // target step lookup
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      await expect(
        service.create(
          {
            stepId: "step_1",
            x: 10,
            y: 10,
            width: 20,
            height: 20,
            targetStepId: "nonexistent",
          },
          USER_ID,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it("validates position — rejects negative values", async () => {
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      await expect(
        service.create(
          { stepId: "step_1", x: -1, y: 10, width: 20, height: 20 },
          USER_ID,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("creates a hotspot with targetStepId in same demo", async () => {
      const hotspot = mockHotspot({ targetStepId: "step_2" });
      repos.stepRepo.getById
        .mockResolvedValueOnce(mockStep()) // step lookup
        .mockResolvedValueOnce(mockStep({ id: "step_2", demoId: "demo_1" })); // target step
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.hotspotRepo.create.mockResolvedValue(hotspot);

      const result = await service.create(
        {
          stepId: "step_1",
          x: 100,
          y: 200,
          width: 50,
          height: 30,
          targetStepId: "step_2",
        },
        USER_ID,
      );

      expect(result).toEqual(hotspot);
    });
  });

  // --- update ---
  describe("update", () => {
    it("updates hotspot fields", async () => {
      const hotspot = mockHotspot();
      const updated = mockHotspot({ x: 150, y: 250 });
      repos.hotspotRepo.getById.mockResolvedValue(hotspot);
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.hotspotRepo.update.mockResolvedValue(updated);

      const result = await service.update(
        "hotspot_1",
        { x: 150, y: 250 },
        USER_ID,
      );

      expect(result).toEqual(updated);
      expect(repos.hotspotRepo.update).toHaveBeenCalledWith("hotspot_1", {
        x: 150,
        y: 250,
      });
    });

    it("re-validates targetStepId if changed", async () => {
      repos.hotspotRepo.getById.mockResolvedValue(mockHotspot());
      repos.stepRepo.getById
        .mockResolvedValueOnce(mockStep()) // step lookup
        .mockResolvedValueOnce(mockStep({ id: "step_other", demoId: "demo_other" })); // target step
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      await expect(
        service.update(
          "hotspot_1",
          { targetStepId: "step_other" },
          USER_ID,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("throws NotFoundError when hotspot doesn't exist", async () => {
      repos.hotspotRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.update("nonexistent", { x: 10 }, USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError for non-members", async () => {
      repos.hotspotRepo.getById.mockResolvedValue(mockHotspot());
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.update("hotspot_1", { x: 10 }, "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("allows setting targetStepId to null (remove branching)", async () => {
      const hotspot = mockHotspot({ targetStepId: "step_2" });
      const updated = mockHotspot({ targetStepId: null });
      repos.hotspotRepo.getById.mockResolvedValue(hotspot);
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.hotspotRepo.update.mockResolvedValue(updated);

      const result = await service.update(
        "hotspot_1",
        { targetStepId: null },
        USER_ID,
      );

      expect(result).toEqual(updated);
      expect(repos.hotspotRepo.update).toHaveBeenCalledWith("hotspot_1", {
        targetStepId: null,
      });
    });
  });

  // --- delete ---
  describe("delete", () => {
    it("deletes a hotspot", async () => {
      repos.hotspotRepo.getById.mockResolvedValue(mockHotspot());
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.hotspotRepo.delete.mockResolvedValue(true);

      const result = await service.delete("hotspot_1", USER_ID);

      expect(result).toBe(true);
      expect(repos.hotspotRepo.delete).toHaveBeenCalledWith("hotspot_1");
    });

    it("throws NotFoundError when hotspot doesn't exist", async () => {
      repos.hotspotRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.delete("nonexistent", USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError for non-members", async () => {
      repos.hotspotRepo.getById.mockResolvedValue(mockHotspot());
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.delete("hotspot_1", "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // --- listByStep ---
  describe("listByStep", () => {
    it("returns hotspots for a step", async () => {
      const hotspots = [
        mockHotspot({ id: "hotspot_1" }),
        mockHotspot({ id: "hotspot_2", x: 300 }),
      ];
      repos.stepRepo.getById.mockResolvedValue(mockStep());
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("editor");
      repos.hotspotRepo.listByStep.mockResolvedValue(hotspots);

      const result = await service.listByStep("step_1", USER_ID);

      expect(result).toEqual(hotspots);
      expect(repos.hotspotRepo.listByStep).toHaveBeenCalledWith("step_1");
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
