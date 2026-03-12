import { z } from "zod";

export const recordViewSchema = z.object({
  demoId: z.string().min(1, "Demo ID is required"),
  viewerHash: z.string().min(1, "Viewer hash is required"),
  totalSteps: z.number().int().min(1, "Total steps must be at least 1"),
  referrer: z.string().nullish(),
  userAgent: z.string().nullish(),
  country: z.string().nullish(),
});

export const updateViewSchema = z.object({
  stepsViewed: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
  completedAt: z.coerce.date().nullish(),
});

export const analyticsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  days: z.coerce.number().int().min(1, "Days must be at least 1").optional(),
});

export type RecordViewInput = z.infer<typeof recordViewSchema>;
export type UpdateViewInput = z.infer<typeof updateViewSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
