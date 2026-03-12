import type { Nullable } from "@porygon/shared";
import { eq } from "drizzle-orm";

import type { Database } from "../client";
import { hotspots } from "../schema/hotspots";

interface CreateHotspotData {
  stepId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetStepId?: Nullable<string>;
  tooltipContent?: Nullable<Record<string, unknown>>;
  tooltipPosition?: string;
  style?: Record<string, unknown>;
}

interface UpdateHotspotData {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  targetStepId?: Nullable<string>;
  tooltipContent?: Nullable<Record<string, unknown>>;
  tooltipPosition?: string;
  style?: Record<string, unknown>;
}

export function createHotspotRepository(db: Database) {
  return {
    async create(data: CreateHotspotData) {
      const [hotspot] = await db.insert(hotspots).values(data).returning();
      return hotspot!;
    },

    async getById(id: string) {
      return db.query.hotspots.findFirst({
        where: eq(hotspots.id, id),
        with: { step: true, targetStep: true },
      });
    },

    async listByStep(stepId: string) {
      return db
        .select()
        .from(hotspots)
        .where(eq(hotspots.stepId, stepId));
    },

    async update(id: string, data: UpdateHotspotData) {
      const [hotspot] = await db
        .update(hotspots)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(hotspots.id, id))
        .returning();
      return hotspot;
    },

    async delete(id: string) {
      const result = await db
        .delete(hotspots)
        .where(eq(hotspots.id, id))
        .returning({ id: hotspots.id });
      return result.length > 0;
    },

    async deleteByStep(stepId: string) {
      const result = await db
        .delete(hotspots)
        .where(eq(hotspots.stepId, stepId))
        .returning({ id: hotspots.id });
      return result.length;
    },
  };
}
