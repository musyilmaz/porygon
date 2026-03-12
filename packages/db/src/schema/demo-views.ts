import { generateId } from "@porygon/shared/utils";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { demos } from "./demos";

export const demoViews = pgTable(
  "demo_views",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    demoId: text("demo_id")
      .notNull()
      .references(() => demos.id, { onDelete: "cascade" }),
    viewerHash: text("viewer_hash").notNull(),
    stepsViewed: integer("steps_viewed").notNull().default(0),
    totalSteps: integer("total_steps").notNull(),
    completed: boolean("completed").notNull().default(false),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    country: text("country"),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [
    index("demo_views_demo_id_idx").on(t.demoId),
    index("demo_views_started_at_idx").on(t.startedAt),
  ],
);

export const demoViewsRelations = relations(demoViews, ({ one }) => ({
  demo: one(demos, {
    fields: [demoViews.demoId],
    references: [demos.id],
  }),
}));
