import { and, count, desc, eq } from "drizzle-orm";

import type { Database } from "../client";
import { user } from "../schema/auth";
import {
  workspaceMembers,
  workspaceRoleEnum,
  workspaces,
} from "../schema/workspaces";

type WorkspaceRole = (typeof workspaceRoleEnum.enumValues)[number];

interface CreateWorkspaceData {
  name: string;
  slug: string;
  ownerId: string;
  plan?: "free" | "pro" | "team" | "business";
}

interface UpdateWorkspaceData {
  name?: string;
  slug?: string;
  plan?: "free" | "pro" | "team" | "business";
}

interface AddMemberData {
  workspaceId: string;
  userId: string;
  role?: WorkspaceRole;
}

export function createWorkspaceRepository(db: Database) {
  return {
    async create(data: CreateWorkspaceData) {
      const [workspace] = await db
        .insert(workspaces)
        .values(data)
        .returning();
      return workspace!;
    },

    async getById(id: string) {
      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, id));
      return workspace;
    },

    async getBySlug(slug: string) {
      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, slug));
      return workspace;
    },

    async update(id: string, data: UpdateWorkspaceData) {
      const [workspace] = await db
        .update(workspaces)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(workspaces.id, id))
        .returning();
      return workspace;
    },

    async listByUser(userId: string) {
      return db
        .select({
          id: workspaces.id,
          name: workspaces.name,
          slug: workspaces.slug,
          plan: workspaces.plan,
          ownerId: workspaces.ownerId,
          createdAt: workspaces.createdAt,
          updatedAt: workspaces.updatedAt,
        })
        .from(workspaces)
        .innerJoin(
          workspaceMembers,
          eq(workspaces.id, workspaceMembers.workspaceId),
        )
        .where(eq(workspaceMembers.userId, userId))
        .orderBy(desc(workspaces.createdAt));
    },

    async addMember(data: AddMemberData) {
      const [member] = await db
        .insert(workspaceMembers)
        .values(data)
        .returning();
      return member!;
    },

    async removeMember(workspaceId: string, userId: string) {
      const result = await db
        .delete(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId),
          ),
        )
        .returning({ id: workspaceMembers.id });
      return result.length > 0;
    },

    async updateMemberRole(
      workspaceId: string,
      userId: string,
      role: WorkspaceRole,
    ) {
      const [member] = await db
        .update(workspaceMembers)
        .set({ role, updatedAt: new Date() })
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId),
          ),
        )
        .returning();
      return member;
    },

    async getMemberRole(workspaceId: string, userId: string) {
      const [member] = await db
        .select({ role: workspaceMembers.role })
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId),
          ),
        );
      return member?.role ?? null;
    },

    async countMembers(workspaceId: string) {
      const [result] = await db
        .select({ count: count() })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, workspaceId));
      return result?.count ?? 0;
    },

    async findUserByEmail(email: string) {
      const [found] = await db
        .select({ id: user.id, name: user.name, email: user.email })
        .from(user)
        .where(eq(user.email, email));
      return found ?? null;
    },

    async listMembers(workspaceId: string) {
      return db
        .select({
          id: workspaceMembers.id,
          workspaceId: workspaceMembers.workspaceId,
          userId: workspaceMembers.userId,
          role: workspaceMembers.role,
          createdAt: workspaceMembers.createdAt,
          updatedAt: workspaceMembers.updatedAt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        })
        .from(workspaceMembers)
        .innerJoin(user, eq(workspaceMembers.userId, user.id))
        .where(eq(workspaceMembers.workspaceId, workspaceId));
    },
  };
}
