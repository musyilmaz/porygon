import { z } from "zod";

import { TOOLTIP_POSITIONS } from "../constants/demo";
import { HEX_COLOR } from "../constants/patterns";

export const createHotspotSchema = z.object({
  stepId: z.string().min(1, "Step ID is required"),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().positive("Width must be positive"),
  height: z.number().positive("Height must be positive"),
  targetStepId: z.string().min(1).nullish(),
  tooltipContent: z.record(z.string(), z.unknown()).nullish(),
  tooltipPosition: z.enum(TOOLTIP_POSITIONS).default("bottom"),
  style: z
    .object({
      borderColor: z.string().regex(HEX_COLOR, "Invalid hex color").optional(),
      borderWidth: z.number().int().min(0).max(10).optional(),
      backgroundColor: z
        .string()
        .regex(HEX_COLOR, "Invalid hex color")
        .optional(),
      opacity: z.number().min(0).max(1).optional(),
      pulseAnimation: z.boolean().optional(),
    })
    .optional(),
});

export const updateHotspotSchema = createHotspotSchema
  .partial()
  .omit({ stepId: true });

export type CreateHotspotInput = z.infer<typeof createHotspotSchema>;
export type UpdateHotspotInput = z.infer<typeof updateHotspotSchema>;
