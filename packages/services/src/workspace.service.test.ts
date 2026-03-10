import type { Database } from "@repo/db";
import { ConflictError } from "@repo/shared";
import { describe, expect, it, vi } from "vitest";

import { createWorkspaceService } from "./workspace.service";

function createMockDb(overrides: {
  selectResult?: unknown[];
  insertResult?: unknown[];
} = {}) {
  const { selectResult = [], insertResult = [{}] } = overrides;

  const mockReturning = vi.fn().mockResolvedValue(insertResult);
  const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

  const mockLimit = vi.fn().mockResolvedValue(selectResult);
  const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
  const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere });
  const mockFrom = vi.fn().mockReturnValue({
    where: mockWhere,
    innerJoin: mockInnerJoin,
    limit: mockLimit,
  });
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

  return {
    db: { select: mockSelect, insert: mockInsert } as unknown as Database,
    mocks: {
      select: mockSelect,
      from: mockFrom,
      where: mockWhere,
      innerJoin: mockInnerJoin,
      limit: mockLimit,
      insert: mockInsert,
      values: mockValues,
      returning: mockReturning,
    },
  };
}

describe("WorkspaceService", () => {
  describe("create", () => {
    it("creates workspace with correct defaults", async () => {
      const workspace = {
        id: "ws_1",
        name: "My Workspace",
        slug: "my-workspace",
        plan: "free",
        ownerId: "user_1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { db, mocks } = createMockDb({
        selectResult: [],
        insertResult: [workspace],
      });

      const service = createWorkspaceService({ db });
      const result = await service.create({ name: "My Workspace" }, "user_1");

      expect(result).toEqual(workspace);
      expect(mocks.insert).toHaveBeenCalledTimes(2);
      expect(mocks.values).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "My Workspace",
          slug: "my-workspace",
          plan: "free",
          ownerId: "user_1",
        }),
      );
    });

    it("generates slug from name", async () => {
      const workspace = {
        id: "ws_1",
        name: "John's Cool Workspace",
        slug: "johns-cool-workspace",
        plan: "free",
        ownerId: "user_1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { db, mocks } = createMockDb({
        selectResult: [],
        insertResult: [workspace],
      });

      const service = createWorkspaceService({ db });
      await service.create({ name: "John's Cool Workspace" }, "user_1");

      expect(mocks.values).toHaveBeenCalledWith(
        expect.objectContaining({ slug: "johns-cool-workspace" }),
      );
    });

    it("handles duplicate slugs by appending suffix", async () => {
      const workspace = {
        id: "ws_1",
        name: "Test",
        slug: "test-abcd",
        plan: "free",
        ownerId: "user_1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First select finds a conflict, second select finds none
      let selectCallCount = 0;
      const mockLimit = vi.fn().mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return Promise.resolve([{ id: "existing" }]);
        return Promise.resolve([]);
      });
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({
        where: mockWhere,
        innerJoin: vi.fn().mockReturnValue({ where: mockWhere }),
        limit: mockLimit,
      });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockReturning = vi.fn().mockResolvedValue([workspace]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      const db = { select: mockSelect, insert: mockInsert } as unknown as Database;

      const service = createWorkspaceService({ db });
      const result = await service.create({ name: "Test" }, "user_1");

      expect(result).toEqual(workspace);
      // Select was called twice (first attempt conflicted, second succeeded)
      expect(mockLimit).toHaveBeenCalledTimes(2);
    });

    it("throws ConflictError after max attempts", async () => {
      const mockLimit = vi.fn().mockResolvedValue([{ id: "existing" }]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const db = {
        select: mockSelect,
        insert: vi.fn(),
      } as unknown as Database;

      const service = createWorkspaceService({ db });

      await expect(
        service.create({ name: "Test" }, "user_1"),
      ).rejects.toThrow(ConflictError);
    });

    it("creates admin member for owner", async () => {
      const workspace = {
        id: "ws_1",
        name: "Test",
        slug: "test",
        plan: "free",
        ownerId: "user_1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { db, mocks } = createMockDb({
        selectResult: [],
        insertResult: [workspace],
      });

      const service = createWorkspaceService({ db });
      await service.create({ name: "Test" }, "user_1");

      // Second insert call is the member
      expect(mocks.insert).toHaveBeenCalledTimes(2);
      expect(mocks.values).toHaveBeenLastCalledWith(
        expect.objectContaining({
          workspaceId: "ws_1",
          userId: "user_1",
          role: "admin",
        }),
      );
    });
  });

  describe("getByUserId", () => {
    it("returns null when no workspace exists", async () => {
      const { db } = createMockDb({ selectResult: [] });

      const service = createWorkspaceService({ db });
      const result = await service.getByUserId("user_1");

      expect(result).toBeNull();
    });

    it("returns workspace when user is a member", async () => {
      const workspace = {
        id: "ws_1",
        name: "Test",
        slug: "test",
        plan: "free",
        ownerId: "user_1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { db } = createMockDb({
        selectResult: [{ workspace }],
      });

      const service = createWorkspaceService({ db });
      const result = await service.getByUserId("user_1");

      expect(result).toEqual(workspace);
    });
  });
});
