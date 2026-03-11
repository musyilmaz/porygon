import { eq } from "drizzle-orm";

import type { Database } from "../client";
import { annotations } from "../schema/annotations";

interface CreateAnnotationData {
  stepId: string;
  type: "blur" | "crop" | "highlight";
  x: number;
  y: number;
  width: number;
  height: number;
  settings?: Record<string, unknown>;
}

interface UpdateAnnotationData {
  type?: "blur" | "crop" | "highlight";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  settings?: Record<string, unknown>;
}

export function createAnnotationRepository(db: Database) {
  return {
    async create(data: CreateAnnotationData) {
      const [annotation] = await db
        .insert(annotations)
        .values(data)
        .returning();
      return annotation!;
    },

    async getById(id: string) {
      return db.query.annotations.findFirst({
        where: eq(annotations.id, id),
        with: { step: true },
      });
    },

    async listByStep(stepId: string) {
      return db
        .select()
        .from(annotations)
        .where(eq(annotations.stepId, stepId));
    },

    async update(id: string, data: UpdateAnnotationData) {
      const [annotation] = await db
        .update(annotations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(annotations.id, id))
        .returning();
      return annotation;
    },

    async delete(id: string) {
      const result = await db
        .delete(annotations)
        .where(eq(annotations.id, id))
        .returning({ id: annotations.id });
      return result.length > 0;
    },

    async deleteByStep(stepId: string) {
      const result = await db
        .delete(annotations)
        .where(eq(annotations.stepId, stepId))
        .returning({ id: annotations.id });
      return result.length;
    },
  };
}
