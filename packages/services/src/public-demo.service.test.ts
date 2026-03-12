import { NotFoundError } from "@repo/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPublicDemoService } from "./public-demo.service";

function mockHotspot(overrides: Record<string, unknown> = {}) {
  return {
    id: "hotspot_1",
    stepId: "step_1",
    x: 100,
    y: 200,
    width: 50,
    height: 30,
    targetStepId: "step_2",
    tooltipContent: { text: "Click here" },
    tooltipPosition: "bottom",
    style: {},
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function mockAnnotation(overrides: Record<string, unknown> = {}) {
  return {
    id: "annotation_1",
    stepId: "step_1",
    type: "highlight" as const,
    x: 10,
    y: 20,
    width: 100,
    height: 50,
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
    hotspots: [mockHotspot()],
    annotations: [mockAnnotation()],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function mockPublishedDemo(overrides: Record<string, unknown> = {}) {
  return {
    id: "demo_1",
    workspaceId: "ws_1",
    title: "My Demo",
    description: "A demo description",
    slug: "my-demo",
    status: "published" as const,
    settings: { theme: "dark" },
    createdBy: "user_1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-02"),
    publishedAt: new Date("2025-01-02"),
    steps: [mockStep()],
    ...overrides,
  };
}

function createMockRepo() {
  return {
    demoRepo: {
      getPublishedBySlug: vi.fn(),
    },
  };
}

type MockRepo = ReturnType<typeof createMockRepo>;

describe("PublicDemoService", () => {
  let repo: MockRepo;
  let service: ReturnType<typeof createPublicDemoService>;

  beforeEach(() => {
    repo = createMockRepo();
    service = createPublicDemoService(
      repo as unknown as Parameters<typeof createPublicDemoService>[0],
    );
  });

  it("returns published demo with all nested data, internal fields stripped", async () => {
    const demo = mockPublishedDemo();
    repo.demoRepo.getPublishedBySlug.mockResolvedValue(demo);

    const result = await service.getBySlug("my-demo");

    expect(result).toEqual({
      id: "demo_1",
      title: "My Demo",
      description: "A demo description",
      slug: "my-demo",
      settings: { theme: "dark" },
      publishedAt: new Date("2025-01-02"),
      steps: [
        {
          id: "step_1",
          orderIndex: 0,
          screenshotUrl: "https://example.com/screenshot.png",
          actionType: "click",
          actionCoordinates: { x: 100, y: 200 },
          hotspots: [
            {
              id: "hotspot_1",
              x: 100,
              y: 200,
              width: 50,
              height: 30,
              targetStepId: "step_2",
              tooltipContent: { text: "Click here" },
              tooltipPosition: "bottom",
              style: {},
            },
          ],
          annotations: [
            {
              id: "annotation_1",
              type: "highlight",
              x: 10,
              y: 20,
              width: 100,
              height: 50,
              settings: {},
            },
          ],
        },
      ],
    });

    // Verify internal fields are NOT present
    expect(result).not.toHaveProperty("workspaceId");
    expect(result).not.toHaveProperty("createdBy");
    expect(result).not.toHaveProperty("status");
    expect(result).not.toHaveProperty("createdAt");
    expect(result).not.toHaveProperty("updatedAt");
  });

  it("throws NotFoundError when slug doesn't exist", async () => {
    repo.demoRepo.getPublishedBySlug.mockResolvedValue(undefined);

    await expect(service.getBySlug("nonexistent")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("throws NotFoundError for draft/archived demos (repo returns undefined)", async () => {
    repo.demoRepo.getPublishedBySlug.mockResolvedValue(undefined);

    await expect(service.getBySlug("draft-demo")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("preserves step ordering from repo", async () => {
    const demo = mockPublishedDemo({
      steps: [
        mockStep({ id: "step_1", orderIndex: 0 }),
        mockStep({ id: "step_2", orderIndex: 1 }),
        mockStep({ id: "step_3", orderIndex: 2 }),
      ],
    });
    repo.demoRepo.getPublishedBySlug.mockResolvedValue(demo);

    const result = await service.getBySlug("my-demo");

    expect(result.steps).toHaveLength(3);
    expect(result.steps[0]!.id).toBe("step_1");
    expect(result.steps[0]!.orderIndex).toBe(0);
    expect(result.steps[1]!.id).toBe("step_2");
    expect(result.steps[1]!.orderIndex).toBe(1);
    expect(result.steps[2]!.id).toBe("step_3");
    expect(result.steps[2]!.orderIndex).toBe(2);
  });

  it("handles demo with empty steps array", async () => {
    const demo = mockPublishedDemo({ steps: [] });
    repo.demoRepo.getPublishedBySlug.mockResolvedValue(demo);

    const result = await service.getBySlug("my-demo");

    expect(result.steps).toEqual([]);
  });
});
