import {
  ConflictError,
  ForbiddenError,
  LimitExceededError,
  NotFoundError,
  ValidationError,
} from "@repo/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDemoService } from "./demo.service";

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

function mockStep(overrides: Record<string, unknown> = {}) {
  return {
    id: "step_1",
    demoId: "demo_1",
    orderIndex: 0,
    screenshotUrl: "https://example.com/screenshot.png",
    actionType: "click" as const,
    actionCoordinates: { x: 100, y: 200 },
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function createMockRepos() {
  return {
    demoRepo: {
      create: vi.fn(),
      getById: vi.fn(),
      getBySlug: vi.fn(),
      listByWorkspace: vi.fn(),
      countByWorkspace: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateStatus: vi.fn(),
    },
    workspaceRepo: {
      getById: vi.fn(),
      getMemberRole: vi.fn(),
    },
    stepRepo: {
      create: vi.fn(),
      listByDemo: vi.fn(),
      countByDemo: vi.fn(),
    },
  };
}

type MockRepos = ReturnType<typeof createMockRepos>;

const USER_ID = "user_1";

describe("DemoService", () => {
  let repos: MockRepos;
  let service: ReturnType<typeof createDemoService>;

  beforeEach(() => {
    repos = createMockRepos();
    service = createDemoService(
      repos as unknown as Parameters<typeof createDemoService>[0],
    );
  });

  // --- create ---
  describe("create", () => {
    it("creates a demo with generated slug", async () => {
      const demo = mockDemo();
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.demoRepo.countByWorkspace.mockResolvedValue(0);
      repos.demoRepo.getBySlug.mockResolvedValue(undefined);
      repos.demoRepo.create.mockResolvedValue(demo);

      const result = await service.create(
        { workspaceId: "ws_1", title: "My Demo" },
        USER_ID,
      );

      expect(result).toEqual(demo);
      expect(repos.demoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: "ws_1",
          title: "My Demo",
          slug: "my-demo",
          createdBy: USER_ID,
        }),
      );
    });

    it("throws LimitExceededError when plan limit reached", async () => {
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ plan: "free" }));
      repos.demoRepo.countByWorkspace.mockResolvedValue(10);

      await expect(
        service.create({ workspaceId: "ws_1", title: "New Demo" }, USER_ID),
      ).rejects.toThrow(LimitExceededError);
    });

    it("retries slug on collision", async () => {
      const demo = mockDemo();
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.demoRepo.countByWorkspace.mockResolvedValue(0);
      repos.demoRepo.getBySlug
        .mockResolvedValueOnce(mockDemo()) // first attempt: conflict
        .mockResolvedValueOnce(undefined); // second attempt: ok
      repos.demoRepo.create.mockResolvedValue(demo);

      await service.create({ workspaceId: "ws_1", title: "My Demo" }, USER_ID);

      expect(repos.demoRepo.getBySlug).toHaveBeenCalledTimes(2);
      // Second call should have a suffix
      const secondSlug = repos.demoRepo.getBySlug.mock.calls[1]![1] as string;
      expect(secondSlug).toMatch(/^my-demo-[a-z0-9]{4}$/);
    });

    it("throws ConflictError after max slug attempts", async () => {
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.demoRepo.countByWorkspace.mockResolvedValue(0);
      repos.demoRepo.getBySlug.mockResolvedValue(mockDemo()); // always conflicts

      await expect(
        service.create({ workspaceId: "ws_1", title: "My Demo" }, USER_ID),
      ).rejects.toThrow(ConflictError);
      expect(repos.demoRepo.getBySlug).toHaveBeenCalledTimes(3);
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.create({ workspaceId: "ws_1", title: "My Demo" }, USER_ID),
      ).rejects.toThrow(ForbiddenError);
    });

    it("does not enforce limit for business plan (unlimited)", async () => {
      const demo = mockDemo();
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ plan: "business" }));
      repos.demoRepo.countByWorkspace.mockResolvedValue(9999);
      repos.demoRepo.getBySlug.mockResolvedValue(undefined);
      repos.demoRepo.create.mockResolvedValue(demo);

      const result = await service.create(
        { workspaceId: "ws_1", title: "My Demo" },
        USER_ID,
      );

      expect(result).toEqual(demo);
    });
  });

  // --- getById ---
  describe("getById", () => {
    it("returns the demo when user has access", async () => {
      const demo = mockDemo();
      repos.demoRepo.getById.mockResolvedValue(demo);
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      const result = await service.getById("demo_1", USER_ID);

      expect(result).toEqual(demo);
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(service.getById("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.getById("demo_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // --- list ---
  describe("list", () => {
    it("returns demos for workspace", async () => {
      const demos = [mockDemo(), mockDemo({ id: "demo_2" })];
      repos.workspaceRepo.getMemberRole.mockResolvedValue("editor");
      repos.demoRepo.listByWorkspace.mockResolvedValue(demos);

      const result = await service.list("ws_1", USER_ID);

      expect(result).toEqual(demos);
      expect(repos.demoRepo.listByWorkspace).toHaveBeenCalledWith("ws_1", undefined);
    });

    it("passes options to repository", async () => {
      repos.workspaceRepo.getMemberRole.mockResolvedValue("editor");
      repos.demoRepo.listByWorkspace.mockResolvedValue([]);

      const opts = { limit: 5, status: "published" as const };
      await service.list("ws_1", USER_ID, opts);

      expect(repos.demoRepo.listByWorkspace).toHaveBeenCalledWith("ws_1", opts);
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.list("ws_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // --- update ---
  describe("update", () => {
    it("updates the demo", async () => {
      const demo = mockDemo();
      const updated = mockDemo({ title: "Updated Title" });
      repos.demoRepo.getById.mockResolvedValue(demo);
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.demoRepo.update.mockResolvedValue(updated);

      const result = await service.update(
        "demo_1",
        { title: "Updated Title" },
        USER_ID,
      );

      expect(result).toEqual(updated);
      expect(repos.demoRepo.update).toHaveBeenCalledWith("demo_1", {
        title: "Updated Title",
      });
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.update("nonexistent", { title: "X" }, USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(
        service.update("demo_1", { title: "X" }, "stranger"),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // --- delete ---
  describe("delete", () => {
    it("deletes the demo", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.demoRepo.delete.mockResolvedValue(true);

      const result = await service.delete("demo_1", USER_ID);

      expect(result).toBe(true);
      expect(repos.demoRepo.delete).toHaveBeenCalledWith("demo_1");
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(service.delete("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.delete("demo_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // --- publish ---
  describe("publish", () => {
    it("publishes a demo with steps", async () => {
      const demo = mockDemo();
      const published = mockDemo({ status: "published" });
      repos.demoRepo.getById.mockResolvedValue(demo);
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.stepRepo.countByDemo.mockResolvedValue(3);
      repos.demoRepo.updateStatus.mockResolvedValue(published);

      const result = await service.publish("demo_1", USER_ID);

      expect(result).toEqual(published);
      expect(repos.demoRepo.updateStatus).toHaveBeenCalledWith(
        "demo_1",
        "published",
      );
    });

    it("throws ValidationError when demo has 0 steps", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.stepRepo.countByDemo.mockResolvedValue(0);

      await expect(service.publish("demo_1", USER_ID)).rejects.toThrow(
        ValidationError,
      );
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(service.publish("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.publish("demo_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // --- unpublish ---
  describe("unpublish", () => {
    it("unpublishes a published demo", async () => {
      const demo = mockDemo({ status: "published" });
      const unpublished = mockDemo({ status: "draft" });
      repos.demoRepo.getById.mockResolvedValue(demo);
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.demoRepo.updateStatus.mockResolvedValue(unpublished);

      const result = await service.unpublish("demo_1", USER_ID);

      expect(result).toEqual(unpublished);
      expect(repos.demoRepo.updateStatus).toHaveBeenCalledWith("demo_1", "draft");
    });

    it("throws ValidationError when demo is not published", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo({ status: "draft" }));
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      await expect(service.unpublish("demo_1", USER_ID)).rejects.toThrow(
        ValidationError,
      );
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(service.unpublish("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  // --- archive ---
  describe("archive", () => {
    it("archives a demo", async () => {
      const demo = mockDemo();
      const archived = mockDemo({ status: "archived" });
      repos.demoRepo.getById.mockResolvedValue(demo);
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.demoRepo.updateStatus.mockResolvedValue(archived);

      const result = await service.archive("demo_1", USER_ID);

      expect(result).toEqual(archived);
      expect(repos.demoRepo.updateStatus).toHaveBeenCalledWith(
        "demo_1",
        "archived",
      );
    });

    it("throws NotFoundError when demo does not exist", async () => {
      repos.demoRepo.getById.mockResolvedValue(undefined);

      await expect(service.archive("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.archive("demo_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // --- duplicate ---
  describe("duplicate", () => {
    it("duplicates demo and copies steps", async () => {
      const original = mockDemo({ title: "Original" });
      const duplicated = mockDemo({
        id: "demo_2",
        title: "Original (copy)",
        slug: "original-copy",
      });
      const steps = [
        mockStep({ id: "step_1", orderIndex: 0 }),
        mockStep({ id: "step_2", orderIndex: 1, screenshotUrl: "https://example.com/s2.png" }),
      ];

      repos.demoRepo.getById.mockResolvedValue(original);
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.demoRepo.countByWorkspace.mockResolvedValue(1);
      repos.demoRepo.getBySlug.mockResolvedValue(undefined);
      repos.demoRepo.create.mockResolvedValue(duplicated);
      repos.stepRepo.listByDemo.mockResolvedValue(steps);
      repos.stepRepo.create.mockResolvedValue(mockStep());

      const result = await service.duplicate("demo_1", USER_ID);

      expect(result).toEqual(duplicated);
      expect(repos.demoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Original (copy)",
          workspaceId: "ws_1",
          createdBy: USER_ID,
        }),
      );
      expect(repos.stepRepo.create).toHaveBeenCalledTimes(2);
      expect(repos.stepRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          demoId: "demo_2",
          orderIndex: 0,
        }),
      );
      expect(repos.stepRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          demoId: "demo_2",
          orderIndex: 1,
        }),
      );
    });

    it("throws LimitExceededError when plan limit reached", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ plan: "free" }));
      repos.demoRepo.countByWorkspace.mockResolvedValue(10);

      await expect(service.duplicate("demo_1", USER_ID)).rejects.toThrow(
        LimitExceededError,
      );
    });

    it("handles slug collision during duplication", async () => {
      const original = mockDemo({ title: "Test" });
      const duplicated = mockDemo({ id: "demo_2", title: "Test (copy)" });

      repos.demoRepo.getById.mockResolvedValue(original);
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.demoRepo.countByWorkspace.mockResolvedValue(1);
      repos.demoRepo.getBySlug
        .mockResolvedValueOnce(mockDemo()) // first: conflict
        .mockResolvedValueOnce(undefined); // second: ok
      repos.demoRepo.create.mockResolvedValue(duplicated);
      repos.stepRepo.listByDemo.mockResolvedValue([]);

      await service.duplicate("demo_1", USER_ID);

      expect(repos.demoRepo.getBySlug).toHaveBeenCalledTimes(2);
      const secondSlug = repos.demoRepo.getBySlug.mock.calls[1]![1] as string;
      expect(secondSlug).toMatch(/^test-copy-[a-z0-9]{4}$/);
    });

    it("throws ForbiddenError when user is not a member", async () => {
      repos.demoRepo.getById.mockResolvedValue(mockDemo());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.duplicate("demo_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });

    it("duplicates demo with no steps", async () => {
      const original = mockDemo({ title: "Empty" });
      const duplicated = mockDemo({ id: "demo_2", title: "Empty (copy)" });

      repos.demoRepo.getById.mockResolvedValue(original);
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.demoRepo.countByWorkspace.mockResolvedValue(0);
      repos.demoRepo.getBySlug.mockResolvedValue(undefined);
      repos.demoRepo.create.mockResolvedValue(duplicated);
      repos.stepRepo.listByDemo.mockResolvedValue([]);

      const result = await service.duplicate("demo_1", USER_ID);

      expect(result).toEqual(duplicated);
      expect(repos.stepRepo.create).not.toHaveBeenCalled();
    });
  });
});
