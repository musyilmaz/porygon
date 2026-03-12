import type { Nullable } from "@porygon/shared";
import { and, asc, count, desc, eq } from "drizzle-orm";

import type { Database } from "../client";
import { demos, demoStatusEnum } from "../schema/demos";
import { steps } from "../schema/steps";

type DemoStatus = (typeof demoStatusEnum.enumValues)[number];

interface CreateDemoData {
  workspaceId: string;
  title: string;
  slug: string;
  createdBy: string;
  description?: Nullable<string>;
  settings?: Record<string, unknown>;
}

interface UpdateDemoData {
  title?: string;
  description?: Nullable<string>;
  status?: DemoStatus;
  settings?: Record<string, unknown>;
}

interface ListOptions {
  limit?: number;
  offset?: number;
  status?: DemoStatus;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export function createDemoRepository(db: Database) {
  const sortColumns = {
    createdAt: demos.createdAt,
    updatedAt: demos.updatedAt,
    title: demos.title,
  } as const;

  return {
    async create(data: CreateDemoData) {
      const [demo] = await db.insert(demos).values(data).returning();
      return demo!;
    },

    async getById(id: string) {
      const [demo] = await db
        .select()
        .from(demos)
        .where(eq(demos.id, id));
      return demo;
    },

    async getBySlug(workspaceId: string, slug: string) {
      const [demo] = await db
        .select()
        .from(demos)
        .where(and(eq(demos.workspaceId, workspaceId), eq(demos.slug, slug)));
      return demo;
    },

    async listByWorkspace(workspaceId: string, opts: ListOptions = {}) {
      const {
        limit = 20,
        offset = 0,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = opts;

      const conditions = [eq(demos.workspaceId, workspaceId)];
      if (status) {
        conditions.push(eq(demos.status, status));
      }

      const column = sortColumns[sortBy];
      const orderFn = sortOrder === "asc" ? asc : desc;

      return db
        .select()
        .from(demos)
        .where(and(...conditions))
        .orderBy(orderFn(column))
        .limit(limit)
        .offset(offset);
    },

    async countByWorkspace(workspaceId: string, status?: DemoStatus) {
      const conditions = [eq(demos.workspaceId, workspaceId)];
      if (status) {
        conditions.push(eq(demos.status, status));
      }

      const [result] = await db
        .select({ count: count() })
        .from(demos)
        .where(and(...conditions));
      return result!.count;
    },

    async update(id: string, data: UpdateDemoData) {
      const [demo] = await db
        .update(demos)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(demos.id, id))
        .returning();
      return demo;
    },

    async delete(id: string) {
      const result = await db
        .delete(demos)
        .where(eq(demos.id, id))
        .returning({ id: demos.id });
      return result.length > 0;
    },

    async getPublishedBySlug(slug: string) {
      return db.query.demos.findFirst({
        where: and(eq(demos.slug, slug), eq(demos.status, "published")),
        with: {
          steps: {
            orderBy: asc(steps.orderIndex),
            with: {
              hotspots: true,
              annotations: true,
            },
          },
        },
      });
    },

    async updateStatus(id: string, status: DemoStatus) {
      const now = new Date();
      const [demo] = await db
        .update(demos)
        .set({
          status,
          updatedAt: now,
          ...(status === "published" ? { publishedAt: now } : {}),
        })
        .where(eq(demos.id, id))
        .returning();
      return demo;
    },
  };
}
