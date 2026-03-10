import { generateId } from "@repo/shared/utils";
import { relations } from "drizzle-orm";
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { demoViews } from "./demo-views";
import { steps } from "./steps";
import { workspaces } from "./workspaces";

export const demoStatusEnum = pgEnum("demo_status", [
  "draft",
  "published",
  "archived",
]);

export const demos = pgTable(
  "demos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    title: text("title").notNull(),
    description: text("description"),
    slug: text("slug").notNull(),
    status: demoStatusEnum("status").notNull().default("draft"),
    settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    publishedAt: timestamp("published_at"),
  },
  (t) => [unique().on(t.workspaceId, t.slug)],
);

export const demosRelations = relations(demos, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [demos.workspaceId],
    references: [workspaces.id],
  }),
  createdByUser: one(user, {
    fields: [demos.createdBy],
    references: [user.id],
  }),
  steps: many(steps),
  demoViews: many(demoViews),
}));
