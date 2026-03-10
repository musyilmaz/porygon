import {
  type Database,
  workspaceMembers,
  workspaces,
} from "@repo/db";
import { ConflictError } from "@repo/shared";
import { generateSlug } from "@repo/shared/utils";
import { eq } from "drizzle-orm";

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

async function uniqueSlug(db: Database, base: string): Promise<string> {
  let slug = base;

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const existing = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1);

    if (existing.length === 0) return slug;

    slug = `${base}-${randomSuffix()}`;
  }

  throw new ConflictError(
    "Unable to generate a unique slug. Please try a different name.",
  );
}

export function createWorkspaceService({ db }: { db: Database }) {
  return {
    async create(input: { name: string }, userId: string) {
      const baseSlug = generateSlug(input.name);
      const slug = await uniqueSlug(db, baseSlug);

      const [workspace] = await db
        .insert(workspaces)
        .values({
          name: input.name,
          slug,
          plan: "free",
          ownerId: userId,
        })
        .returning();

      await db.insert(workspaceMembers).values({
        workspaceId: workspace!.id,
        userId,
        role: "admin",
      });

      return workspace!;
    },

    async getByUserId(userId: string) {
      const result = await db
        .select({ workspace: workspaces })
        .from(workspaceMembers)
        .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
        .where(eq(workspaceMembers.userId, userId))
        .limit(1);

      return result[0]?.workspace ?? null;
    },
  };
}
