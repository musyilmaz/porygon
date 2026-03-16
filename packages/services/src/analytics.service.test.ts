import { NotFoundError, ValidationError } from "@porygon/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAnalyticsService } from "./analytics.service";

function mockDemo(overrides: Record<string, unknown> = {}) {
  return {
    id: "demo_1",
    workspaceId: "ws_1",
    title: "My Demo",
    description: null,
    slug: "my-demo",
    status: "published" as const,
    settings: {},
    createdBy: "user_1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    publishedAt: new Date("2025-01-02"),
    ...overrides,
  };
}

function mockView(overrides: Record<string, unknown> = {}) {
  return {
    id: "view_1",
    demoId: "demo_1",
    viewerHash: "abc123",
    totalSteps: 5,
    stepsViewed: 3,
    completed: false,
    completedAt: null,
    referrer: null,
    userAgent: null,
    country: null,
    startedAt: new Date("2025-01-10"),
    ...overrides,
  };
}

function createMockRepos() {
  return {
    analyticsRepo: {
      recordView: vi.fn(),
      updateView: vi.fn(),
      getByDemo: vi.fn(),
      getAggregates: vi.fn(),
      getDailyStats: vi.fn(),
      getStepDropoff: vi.fn(),
    },
    demoRepo: {
      getById: vi.fn(),
    },
  };
}

type MockRepos = ReturnType<typeof createMockRepos>;

describe("AnalyticsService", () => {
  let repos: MockRepos;
  let service: ReturnType<typeof createAnalyticsService>;

  beforeEach(() => {
    repos = createMockRepos();
    service = createAnalyticsService(
      repos as unknown as Parameters<typeof createAnalyticsService>[0],
    );
  });

  // --- recordView ---
  describe("recordView", () => {
    it("records view for published demo", async () => {
      const demo = mockDemo({ status: "published" });
      const view = mockView();
      repos.demoRepo.getById.mockResolvedValue(demo);
      repos.analyticsRepo.recordView.mockResolvedValue(view);

      const input = {
        demoId: "demo_1",
        viewerHash: "abc123",
        totalSteps: 5,
      };
      const result = await service.recordView(input);

      expect(result).toEqual(view);
      expect(repos.analyticsRepo.recordView).toHaveBeenCalledWith(input);
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.recordView({
          demoId: "nonexistent",
          viewerHash: "abc123",
          totalSteps: 5,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ValidationError when demo is draft", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo({ status: "draft" }));

      await expect(
        service.recordView({
          demoId: "demo_1",
          viewerHash: "abc123",
          totalSteps: 5,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("throws ValidationError when demo is archived", async () => {
      repos.demoRepo.getById.mockResolvedValue(
        mockDemo({ status: "archived" }),
      );

      await expect(
        service.recordView({
          demoId: "demo_1",
          viewerHash: "abc123",
          totalSteps: 5,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("passes all input fields through to repo", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.analyticsRepo.recordView.mockResolvedValue(mockView());

      const input = {
        demoId: "demo_1",
        viewerHash: "abc123",
        totalSteps: 5,
        referrer: "https://example.com",
        userAgent: "Mozilla/5.0",
        country: "US",
      };
      await service.recordView(input);

      expect(repos.analyticsRepo.recordView).toHaveBeenCalledWith(input);
    });
  });

  // --- updateView ---
  describe("updateView", () => {
    it("updates view successfully", async () => {
      const updated = mockView({ stepsViewed: 4 });
      repos.analyticsRepo.updateView.mockResolvedValue(updated);

      const result = await service.updateView("view_1", { stepsViewed: 4 });

      expect(result).toEqual(updated);
      expect(repos.analyticsRepo.updateView).toHaveBeenCalledWith("view_1", {
        stepsViewed: 4,
      });
    });

    it("throws NotFoundError when view does not exist", async () => {
      repos.analyticsRepo.updateView.mockResolvedValue(undefined);

      await expect(
        service.updateView("nonexistent", { stepsViewed: 2 }),
      ).rejects.toThrow(NotFoundError);
    });

    it("updates with completion data", async () => {
      const completedAt = new Date("2025-01-10T12:00:00Z");
      const updated = mockView({
        completed: true,
        completedAt,
        stepsViewed: 5,
      });
      repos.analyticsRepo.updateView.mockResolvedValue(updated);

      const result = await service.updateView("view_1", {
        stepsViewed: 5,
        completed: true,
        completedAt,
      });

      expect(result).toEqual(updated);
      expect(repos.analyticsRepo.updateView).toHaveBeenCalledWith("view_1", {
        stepsViewed: 5,
        completed: true,
        completedAt,
      });
    });
  });

  // --- getDemoAnalytics ---
  describe("getDemoAnalytics", () => {
    it("returns aggregates for existing demo", async () => {
      const aggregates = {
        totalViews: 100,
        uniqueViewers: 80,
        completionRate: 65.5,
        avgStepsViewed: 3.2,
        topReferrers: [{ referrer: "google.com", count: 50 }],
      };
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.analyticsRepo.getAggregates.mockResolvedValue(aggregates);

      const result = await service.getDemoAnalytics("demo_1");

      expect(result).toEqual(aggregates);
      expect(repos.analyticsRepo.getAggregates).toHaveBeenCalledWith(
        "demo_1",
        undefined,
      );
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.getDemoAnalytics("nonexistent"),
      ).rejects.toThrow(NotFoundError);
    });

    it("passes dateRange to repo", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.analyticsRepo.getAggregates.mockResolvedValue({
        totalViews: 10,
        uniqueViewers: 8,
        completionRate: 50,
        avgStepsViewed: 2,
        topReferrers: [],
      });

      const dateRange = {
        from: new Date("2025-01-01"),
        to: new Date("2025-01-31"),
      };
      await service.getDemoAnalytics("demo_1", dateRange);

      expect(repos.analyticsRepo.getAggregates).toHaveBeenCalledWith(
        "demo_1",
        dateRange,
      );
    });
  });

  // --- getDailyStats ---
  describe("getDailyStats", () => {
    it("returns daily stats for existing demo", async () => {
      const stats = [
        {
          date: "2025-01-10",
          views: 20,
          uniqueViewers: 15,
          completions: 10,
        },
        {
          date: "2025-01-11",
          views: 25,
          uniqueViewers: 20,
          completions: 12,
        },
      ];
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.analyticsRepo.getDailyStats.mockResolvedValue(stats);

      const result = await service.getDailyStats("demo_1");

      expect(result).toEqual(stats);
      expect(repos.analyticsRepo.getDailyStats).toHaveBeenCalledWith(
        "demo_1",
        undefined,
      );
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.getDailyStats("nonexistent"),
      ).rejects.toThrow(NotFoundError);
    });

    it("passes dateRange to repo", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.analyticsRepo.getDailyStats.mockResolvedValue([]);

      const dateRange = {
        from: new Date("2025-01-01"),
        to: new Date("2025-01-31"),
      };
      await service.getDailyStats("demo_1", dateRange);

      expect(repos.analyticsRepo.getDailyStats).toHaveBeenCalledWith(
        "demo_1",
        dateRange,
      );
    });
  });

  // --- getStepDropoff ---
  describe("getStepDropoff", () => {
    it("returns step dropoff for existing demo", async () => {
      const dropoff = [
        { step: 1, viewers: 100 },
        { step: 2, viewers: 80 },
        { step: 3, viewers: 50 },
      ];
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.analyticsRepo.getStepDropoff.mockResolvedValue(dropoff);

      const result = await service.getStepDropoff("demo_1");

      expect(result).toEqual(dropoff);
      expect(repos.analyticsRepo.getStepDropoff).toHaveBeenCalledWith(
        "demo_1",
        undefined,
      );
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.getStepDropoff("nonexistent"),
      ).rejects.toThrow(NotFoundError);
    });

    it("passes dateRange to repo", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.analyticsRepo.getStepDropoff.mockResolvedValue([]);

      const dateRange = {
        from: new Date("2025-01-01"),
        to: new Date("2025-01-31"),
      };
      await service.getStepDropoff("demo_1", dateRange);

      expect(repos.analyticsRepo.getStepDropoff).toHaveBeenCalledWith(
        "demo_1",
        dateRange,
      );
    });
  });
});
