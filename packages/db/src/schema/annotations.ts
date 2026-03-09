import { generateId } from "@repo/shared/src/utils/id";
import { relations } from "drizzle-orm";
import {
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { steps } from "./steps";

export const annotationTypeEnum = pgEnum("annotation_type", [
  "blur",
  "crop",
  "highlight",
]);

export const annotations = pgTable("annotations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  stepId: text("step_id")
    .notNull()
    .references(() => steps.id, { onDelete: "cascade" }),
  type: annotationTypeEnum("type").notNull(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  width: real("width").notNull(),
  height: real("height").notNull(),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const annotationsRelations = relations(annotations, ({ one }) => ({
  step: one(steps, {
    fields: [annotations.stepId],
    references: [steps.id],
  }),
}));
