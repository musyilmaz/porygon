import type { HotspotStyle, HotspotType, TooltipPosition } from "@porygon/shared";
import { generateId } from "@porygon/shared/utils";
import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { steps } from "./steps";

export const hotspotTypeEnum = pgEnum("hotspot_type", [
  "click_zone",
  "area",
  "callout",
]);

export const hotspots = pgTable("hotspots", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  stepId: text("step_id")
    .notNull()
    .references(() => steps.id, { onDelete: "cascade" }),
  type: hotspotTypeEnum("type").notNull().default("click_zone").$type<HotspotType>(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  width: real("width").notNull(),
  height: real("height").notNull(),
  targetStepId: text("target_step_id").references(() => steps.id),
  tooltipContent: jsonb("tooltip_content").$type<Record<string, unknown>>(),
  tooltipPosition: text("tooltip_position").notNull().default("bottom").$type<TooltipPosition>(),
  style: jsonb("style").$type<HotspotStyle>().default({}),
  openByDefault: boolean("open_by_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const hotspotsRelations = relations(hotspots, ({ one }) => ({
  step: one(steps, {
    fields: [hotspots.stepId],
    references: [steps.id],
    relationName: "stepHotspots",
  }),
  targetStep: one(steps, {
    fields: [hotspots.targetStepId],
    references: [steps.id],
    relationName: "hotspotsTargetingStep",
  }),
}));
