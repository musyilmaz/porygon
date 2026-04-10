import { z } from "zod";

import { ACTION_TYPES, MEDIA_TYPES } from "../constants/demo";

export const createStepSchema = z.object({
  demoId: z.string().min(1, "Demo ID is required"),
  orderIndex: z.number().int().min(0),
  screenshotUrl: z.string().min(1, "Screenshot URL is required"),
  mediaType: z.enum(MEDIA_TYPES).default("image"),
  videoUrl: z.string().url().nullish(),
  actionType: z.enum(ACTION_TYPES),
  actionCoordinates: z
    .object({
      x: z.number().min(0),
      y: z.number().min(0),
    })
    .nullish(),
});

export const createStepBodySchema = z.object({
  screenshotUrl: z.string().min(1).optional(),
  mediaType: z.enum(MEDIA_TYPES).default("image"),
  videoUrl: z.string().url().nullish(),
  actionType: z.enum(ACTION_TYPES).optional(),
  actionCoordinates: z
    .object({
      x: z.number().min(0),
      y: z.number().min(0),
    })
    .nullish(),
});

export const updateStepSchema = z.object({
  orderIndex: z.number().int().min(0).optional(),
  screenshotUrl: z.string().min(1).optional(),
  mediaType: z.enum(MEDIA_TYPES).optional(),
  videoUrl: z.string().url().nullish(),
  actionType: z.enum(ACTION_TYPES).optional(),
  actionCoordinates: z
    .object({
      x: z.number().min(0),
      y: z.number().min(0),
    })
    .nullish(),
});

export const reorderStepsSchema = z.object({
  stepIds: z.array(z.string().min(1)).min(1, "At least one step ID is required"),
});

export type CreateStepInput = z.infer<typeof createStepSchema>;
export type CreateStepBody = z.infer<typeof createStepBodySchema>;
export type UpdateStepInput = z.infer<typeof updateStepSchema>;
export type ReorderStepsInput = z.infer<typeof reorderStepsSchema>;
