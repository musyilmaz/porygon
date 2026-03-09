import { z } from "zod";

import { ANNOTATION_TYPES } from "../constants/demo";
import { HEX_COLOR } from "../constants/patterns";

export const createAnnotationSchema = z.object({
  stepId: z.string().min(1, "Step ID is required"),
  type: z.enum(ANNOTATION_TYPES),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  settings: z
    .object({
      blurIntensity: z.number().min(0).max(100).optional(),
      highlightColor: z
        .string()
        .regex(HEX_COLOR, "Invalid hex color")
        .optional(),
      highlightOpacity: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export type CreateAnnotationInput = z.infer<typeof createAnnotationSchema>;
