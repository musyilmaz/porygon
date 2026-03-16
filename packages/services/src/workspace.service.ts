import type { createWorkspaceRepository } from "@porygon/db";
import {
  ConflictError,
  ForbiddenError,
  LimitExceededError,
  NotFoundError,
  PLAN_LIMITS,
} from "@porygon/shared";
import { generateSlug } from "@porygon/shared/utils";

type WorkspaceRepo = ReturnType<typeof createWorkspaceRepository>;

interface WorkspaceServiceDeps {
  workspaceRepo: WorkspaceRepo;
}

const SUFFIX_LENGTH = 4;
const MAX_SLUG_ATTEMPTS = 3;

function randomSuffix(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function createWorkspaceService({ workspaceRepo }: WorkspaceServiceDeps) {
  async function getWorkspaceOrThrow(id: string) {
    const workspace = await workspaceRepo.getById(id);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }
    return workspace;
  }

  async function assertMember(workspaceId: string, userId: string) {
    const role = await workspaceRepo.getMemberRole(workspaceId, userId);
    if (!role) {
      throw new ForbiddenError("You are not a member of this workspace");
    }
    return role;
  }

  async function assertAdmin(workspaceId: string, userId: string) {
    const role = await assertMember(workspaceId, userId);
    if (role !== "admin") {
      throw new ForbiddenError("Only admins can perform this action");
    }
    return role;
  }

  async function uniqueSlug(base: string) {
    let slug = base;

    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const existing = await workspaceRepo.getBySlug(slug);
      if (!existing) return slug;
      slug = `${base}-${randomSuffix()}`;
    }

    throw new ConflictError(
      "Unable to generate a unique slug. Please try a different name.",
    );
  }

  const service = {
    async create(input: { name: string }, userId: string) {
      const baseSlug = generateSlug(input.name);
      const slug = await uniqueSlug(baseSlug);

      const workspace = await workspaceRepo.create({
        name: input.name,
        slug,
        plan: "free",
        ownerId: userId,
      });

      await workspaceRepo.addMember({
        workspaceId: workspace.id,
        userId,
        role: "admin",
      });

      return workspace;
    },

    async getById(id: string, userId: string) {
      const workspace = await getWorkspaceOrThrow(id);
      await assertMember(id, userId);
      return workspace;
    },

    async list(userId: string) {
      return workspaceRepo.listByUser(userId);
    },

    async update(id: string, input: { name?: string; slug?: string }, userId: string) {
      await getWorkspaceOrThrow(id);
      await assertAdmin(id, userId);

      if (input.slug) {
        const existing = await workspaceRepo.getBySlug(input.slug);
        if (existing && existing.id !== id) {
          throw new ConflictError("Slug is already in use");
        }
      }

      return workspaceRepo.update(id, input);
    },

    async addMember(
      workspaceId: string,
      targetUserId: string,
      role: "admin" | "editor" | "viewer",
      actorId: string,
    ) {
      const workspace = await getWorkspaceOrThrow(workspaceId);
      await assertAdmin(workspaceId, actorId);

      const existingRole = await workspaceRepo.getMemberRole(workspaceId, targetUserId);
      if (existingRole) {
        throw new ConflictError("User is already a member of this workspace");
      }

      const limit = PLAN_LIMITS[workspace.plan].maxWorkspaceMembers;
      if (limit !== -1) {
        const memberCount = await workspaceRepo.countMembers(workspaceId);
        if (memberCount >= limit) {
          throw new LimitExceededError(
            `Member limit reached for ${workspace.plan} plan (max ${limit})`,
          );
        }
      }

      return workspaceRepo.addMember({
        workspaceId,
        userId: targetUserId,
        role,
      });
    },

    async addMemberByEmail(
      workspaceId: string,
      email: string,
      role: "admin" | "editor" | "viewer",
      actorId: string,
    ) {
      const targetUser = await workspaceRepo.findUserByEmail(email);
      if (!targetUser) {
        throw new NotFoundError("No user found with that email");
      }

      return service.addMember(workspaceId, targetUser.id, role, actorId);
    },

    async removeMember(
      workspaceId: string,
      targetUserId: string,
      actorId: string,
    ) {
      const workspace = await getWorkspaceOrThrow(workspaceId);
      await assertAdmin(workspaceId, actorId);

      if (workspace.ownerId === targetUserId) {
        throw new ForbiddenError("Cannot remove the workspace owner");
      }

      const targetRole = await workspaceRepo.getMemberRole(workspaceId, targetUserId);
      if (!targetRole) {
        throw new NotFoundError("User is not a member of this workspace");
      }

      return workspaceRepo.removeMember(workspaceId, targetUserId);
    },

    async listMembers(workspaceId: string, userId: string) {
      await getWorkspaceOrThrow(workspaceId);
      await assertMember(workspaceId, userId);
      return workspaceRepo.listMembers(workspaceId);
    },

    async updateMemberRole(
      workspaceId: string,
      targetUserId: string,
      role: "admin" | "editor" | "viewer",
      actorId: string,
    ) {
      const workspace = await getWorkspaceOrThrow(workspaceId);
      await assertAdmin(workspaceId, actorId);

      if (workspace.ownerId === targetUserId) {
        throw new ForbiddenError("Cannot change the workspace owner's role");
      }

      const targetRole = await workspaceRepo.getMemberRole(workspaceId, targetUserId);
      if (!targetRole) {
        throw new NotFoundError("User is not a member of this workspace");
      }

      return workspaceRepo.updateMemberRole(workspaceId, targetUserId, role);
    },
  };

  return service;
}
