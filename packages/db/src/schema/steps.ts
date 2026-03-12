import { generateId } from "@porygon/shared/utils";
import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { annotations } from "./annotations";
import { demos } from "./demos";
import { hotspots } from "./hotspots";

export const actionTypeEnum = pgEnum("action_type", [
  "click",
  "scroll",
  "type",
  "navigation",
]);

export const steps = pgTable("steps", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  demoId: text("demo_id")
    .notNull()
    .references(() => demos.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  screenshotUrl: text("screenshot_url"),
  actionType: actionTypeEnum("action_type"),
  actionCoordinates:
    jsonb("action_coordinates").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stepsRelations = relations(steps, ({ one, many }) => ({
  demo: one(demos, {
    fields: [steps.demoId],
    references: [demos.id],
  }),
  hotspots: many(hotspots, { relationName: "stepHotspots" }),
  targetedByHotspots: many(hotspots, { relationName: "hotspotsTargetingStep" }),
  annotations: many(annotations),
}));
