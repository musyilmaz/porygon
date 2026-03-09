import { z } from "zod";

import { DEMO_STATUSES } from "../constants/demo";
import { HEX_COLOR } from "../constants/patterns";

export const createDemoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .nullish(),
});

export const updateDemoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .nullish(),
  status: z.enum(DEMO_STATUSES).optional(),
  settings: z
    .object({
      showProgressBar: z.boolean().optional(),
      autoPlay: z.boolean().optional(),
      autoPlayDelay: z.number().int().min(500).max(10000).optional(),
      showNavigation: z.boolean().optional(),
      brandColor: z.string().regex(HEX_COLOR, "Invalid hex color").optional(),
    })
    .optional(),
});

export type CreateDemoInput = z.infer<typeof createDemoSchema>;
export type UpdateDemoInput = z.infer<typeof updateDemoSchema>;
