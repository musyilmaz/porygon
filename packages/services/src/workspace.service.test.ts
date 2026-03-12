import {
  ConflictError,
  ForbiddenError,
  LimitExceededError,
  NotFoundError,
} from "@repo/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWorkspaceService } from "./workspace.service";

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

function createMockRepo() {
  return {
    workspaceRepo: {
      create: vi.fn(),
      getById: vi.fn(),
      getBySlug: vi.fn(),
      update: vi.fn(),
      listByUser: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      updateMemberRole: vi.fn(),
      getMemberRole: vi.fn(),
      countMembers: vi.fn(),
      listMembers: vi.fn(),
    },
  };
}

type MockRepo = ReturnType<typeof createMockRepo>;

const USER_ID = "user_1";
const OTHER_USER = "user_2";

describe("WorkspaceService", () => {
  let repos: MockRepo;
  let service: ReturnType<typeof createWorkspaceService>;

  beforeEach(() => {
    repos = createMockRepo();
    service = createWorkspaceService(
      repos as unknown as Parameters<typeof createWorkspaceService>[0],
    );
  });

  // --- create ---
  describe("create", () => {
    it("creates workspace with generated slug and admin member", async () => {
      const workspace = mockWorkspace();
      repos.workspaceRepo.getBySlug.mockResolvedValue(undefined);
      repos.workspaceRepo.create.mockResolvedValue(workspace);
      repos.workspaceRepo.addMember.mockResolvedValue({});

      const result = await service.create({ name: "Test Workspace" }, USER_ID);

      expect(result).toEqual(workspace);
      expect(repos.workspaceRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Workspace",
          slug: "test-workspace",
          plan: "free",
          ownerId: USER_ID,
        }),
      );
      expect(repos.workspaceRepo.addMember).toHaveBeenCalledWith({
        workspaceId: "ws_1",
        userId: USER_ID,
        role: "admin",
      });
    });

    it("retries slug on collision", async () => {
      const workspace = mockWorkspace();
      repos.workspaceRepo.getBySlug
        .mockResolvedValueOnce(mockWorkspace())
        .mockResolvedValueOnce(undefined);
      repos.workspaceRepo.create.mockResolvedValue(workspace);
      repos.workspaceRepo.addMember.mockResolvedValue({});

      await service.create({ name: "Test Workspace" }, USER_ID);

      expect(repos.workspaceRepo.getBySlug).toHaveBeenCalledTimes(2);
      const secondSlug = repos.workspaceRepo.getBySlug.mock.calls[1]![0] as string;
      expect(secondSlug).toMatch(/^test-workspace-[a-z0-9]{4}$/);
    });

    it("throws ConflictError after max slug attempts", async () => {
      repos.workspaceRepo.getBySlug.mockResolvedValue(mockWorkspace());

      await expect(
        service.create({ name: "Test Workspace" }, USER_ID),
      ).rejects.toThrow(ConflictError);
      expect(repos.workspaceRepo.getBySlug).toHaveBeenCalledTimes(3);
    });
  });

  // --- getById ---
  describe("getById", () => {
    it("returns workspace for member", async () => {
      const workspace = mockWorkspace();
      repos.workspaceRepo.getById.mockResolvedValue(workspace);
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      const result = await service.getById("ws_1", USER_ID);

      expect(result).toEqual(workspace);
    });

    it("throws NotFoundError for missing workspace", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(undefined);

      await expect(service.getById("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError for non-member", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.getById("ws_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // --- list ---
  describe("list", () => {
    it("returns workspaces for user", async () => {
      const workspaces = [mockWorkspace(), mockWorkspace({ id: "ws_2" })];
      repos.workspaceRepo.listByUser.mockResolvedValue(workspaces);

      const result = await service.list(USER_ID);

      expect(result).toEqual(workspaces);
      expect(repos.workspaceRepo.listByUser).toHaveBeenCalledWith(USER_ID);
    });
  });

  // --- update ---
  describe("update", () => {
    it("admin can update workspace name", async () => {
      const updated = mockWorkspace({ name: "Updated" });
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.update.mockResolvedValue(updated);

      const result = await service.update("ws_1", { name: "Updated" }, USER_ID);

      expect(result).toEqual(updated);
      expect(repos.workspaceRepo.update).toHaveBeenCalledWith("ws_1", {
        name: "Updated",
      });
    });

    it("throws ForbiddenError for editor", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("editor");

      await expect(
        service.update("ws_1", { name: "X" }, OTHER_USER),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws ForbiddenError for viewer", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("viewer");

      await expect(
        service.update("ws_1", { name: "X" }, OTHER_USER),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError for missing workspace", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.update("nonexistent", { name: "X" }, USER_ID),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // --- listMembers ---
  describe("listMembers", () => {
    it("returns members for workspace member", async () => {
      const members = [
        { id: "m_1", workspaceId: "ws_1", userId: USER_ID, role: "admin", user: { id: USER_ID, name: "User 1", email: "u1@test.com", image: null } },
        { id: "m_2", workspaceId: "ws_1", userId: OTHER_USER, role: "editor", user: { id: OTHER_USER, name: "User 2", email: "u2@test.com", image: null } },
      ];
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");
      repos.workspaceRepo.listMembers.mockResolvedValue(members);

      const result = await service.listMembers("ws_1", USER_ID);

      expect(result).toEqual(members);
      expect(repos.workspaceRepo.listMembers).toHaveBeenCalledWith("ws_1");
    });

    it("throws NotFoundError for missing workspace", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(undefined);

      await expect(service.listMembers("nonexistent", USER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws ForbiddenError for non-member", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole.mockResolvedValue(null);

      await expect(service.listMembers("ws_1", "stranger")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // --- addMember ---
  describe("addMember", () => {
    it("admin adds a new member", async () => {
      const member = { id: "m_1", workspaceId: "ws_1", userId: OTHER_USER, role: "editor" };
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ plan: "pro" }));
      repos.workspaceRepo.getMemberRole
        .mockResolvedValueOnce("admin")   // actor check
        .mockResolvedValueOnce(null);     // target not already member
      repos.workspaceRepo.countMembers.mockResolvedValue(1);
      repos.workspaceRepo.addMember.mockResolvedValue(member);

      const result = await service.addMember("ws_1", OTHER_USER, "editor", USER_ID);

      expect(result).toEqual(member);
      expect(repos.workspaceRepo.addMember).toHaveBeenCalledWith({
        workspaceId: "ws_1",
        userId: OTHER_USER,
        role: "editor",
      });
    });

    it("throws LimitExceededError when plan limit reached", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ plan: "free" }));
      repos.workspaceRepo.getMemberRole
        .mockResolvedValueOnce("admin")
        .mockResolvedValueOnce(null);
      repos.workspaceRepo.countMembers.mockResolvedValue(1);

      await expect(
        service.addMember("ws_1", OTHER_USER, "editor", USER_ID),
      ).rejects.toThrow(LimitExceededError);
    });

    it("throws ConflictError for existing member", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole
        .mockResolvedValueOnce("admin")
        .mockResolvedValueOnce("editor");

      await expect(
        service.addMember("ws_1", OTHER_USER, "editor", USER_ID),
      ).rejects.toThrow(ConflictError);
    });

    it("throws ForbiddenError for non-admin", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("editor");

      await expect(
        service.addMember("ws_1", OTHER_USER, "viewer", "editor_user"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("business plan allows unlimited members", async () => {
      const member = { id: "m_1", workspaceId: "ws_1", userId: OTHER_USER, role: "editor" };
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ plan: "business" }));
      repos.workspaceRepo.getMemberRole
        .mockResolvedValueOnce("admin")
        .mockResolvedValueOnce(null);
      repos.workspaceRepo.addMember.mockResolvedValue(member);

      const result = await service.addMember("ws_1", OTHER_USER, "editor", USER_ID);

      expect(result).toEqual(member);
      expect(repos.workspaceRepo.countMembers).not.toHaveBeenCalled();
    });

    it("throws NotFoundError for missing workspace", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.addMember("nonexistent", OTHER_USER, "editor", USER_ID),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // --- removeMember ---
  describe("removeMember", () => {
    it("admin removes a member", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole
        .mockResolvedValueOnce("admin")    // actor check
        .mockResolvedValueOnce("editor");  // target is a member
      repos.workspaceRepo.removeMember.mockResolvedValue(true);

      const result = await service.removeMember("ws_1", OTHER_USER, USER_ID);

      expect(result).toBe(true);
      expect(repos.workspaceRepo.removeMember).toHaveBeenCalledWith("ws_1", OTHER_USER);
    });

    it("throws ForbiddenError when removing owner", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ ownerId: OTHER_USER }));
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      await expect(
        service.removeMember("ws_1", OTHER_USER, USER_ID),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError for non-member target", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole
        .mockResolvedValueOnce("admin")
        .mockResolvedValueOnce(null);

      await expect(
        service.removeMember("ws_1", "stranger", USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError for non-admin actor", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("editor");

      await expect(
        service.removeMember("ws_1", OTHER_USER, "editor_user"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError for missing workspace", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.removeMember("nonexistent", OTHER_USER, USER_ID),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // --- updateMemberRole ---
  describe("updateMemberRole", () => {
    it("admin changes member role", async () => {
      const updated = { id: "m_1", workspaceId: "ws_1", userId: OTHER_USER, role: "viewer" };
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole
        .mockResolvedValueOnce("admin")    // actor check
        .mockResolvedValueOnce("editor");  // target is a member
      repos.workspaceRepo.updateMemberRole.mockResolvedValue(updated);

      const result = await service.updateMemberRole("ws_1", OTHER_USER, "viewer", USER_ID);

      expect(result).toEqual(updated);
      expect(repos.workspaceRepo.updateMemberRole).toHaveBeenCalledWith(
        "ws_1",
        OTHER_USER,
        "viewer",
      );
    });

    it("throws ForbiddenError when changing owner's role", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace({ ownerId: OTHER_USER }));
      repos.workspaceRepo.getMemberRole.mockResolvedValue("admin");

      await expect(
        service.updateMemberRole("ws_1", OTHER_USER, "viewer", USER_ID),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError for non-member target", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole
        .mockResolvedValueOnce("admin")
        .mockResolvedValueOnce(null);

      await expect(
        service.updateMemberRole("ws_1", "stranger", "viewer", USER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError for non-admin actor", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(mockWorkspace());
      repos.workspaceRepo.getMemberRole.mockResolvedValue("editor");

      await expect(
        service.updateMemberRole("ws_1", OTHER_USER, "viewer", "editor_user"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError for missing workspace", async () => {
      repos.workspaceRepo.getById.mockResolvedValue(undefined);

      await expect(
        service.updateMemberRole("nonexistent", OTHER_USER, "viewer", USER_ID),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
