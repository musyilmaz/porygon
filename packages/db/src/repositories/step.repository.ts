import { asc, count, eq } from "drizzle-orm";

import type { Database } from "../client";
import { steps } from "../schema/steps";

interface CreateStepData {
  demoId: string;
  orderIndex: number;
  screenshotUrl?: string | null;
  actionType?: "click" | "scroll" | "type" | "navigation";
  actionCoordinates?: Record<string, unknown> | null;
}

interface UpdateStepData {
  screenshotUrl?: string | null;
  actionType?: "click" | "scroll" | "type" | "navigation" | null;
  actionCoordinates?: Record<string, unknown> | null;
}

export function createStepRepository(db: Database) {
  return {
    async create(data: CreateStepData) {
      const [step] = await db.insert(steps).values(data).returning();
      return step!;
    },

    async getById(id: string) {
      return db.query.steps.findFirst({
        where: eq(steps.id, id),
        with: { hotspots: true, annotations: true },
      });
    },

    async listByDemo(demoId: string) {
      return db
        .select()
        .from(steps)
        .where(eq(steps.demoId, demoId))
        .orderBy(asc(steps.orderIndex));
    },

    async update(id: string, data: UpdateStepData) {
      const [step] = await db
        .update(steps)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(steps.id, id))
        .returning();
      return step;
    },

    async delete(id: string) {
      const result = await db
        .delete(steps)
        .where(eq(steps.id, id))
        .returning({ id: steps.id });
      return result.length > 0;
    },

    async reorder(items: { id: string; orderIndex: number }[]) {
      await Promise.all(
        items.map((item) =>
          db
            .update(steps)
            .set({ orderIndex: item.orderIndex, updatedAt: new Date() })
            .where(eq(steps.id, item.id))
        )
      );
    },

    async countByDemo(demoId: string) {
      const [result] = await db
        .select({ count: count() })
        .from(steps)
        .where(eq(steps.demoId, demoId));
      return result!.count;
    },
  };
}
