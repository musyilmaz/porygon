import { z } from "zod";

import { ALLOWED_CONTENT_TYPES } from "../constants/upload";

export const createUploadSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  demoId: z.string().min(1, "Demo ID is required"),
  stepId: z.string().min(1, "Step ID is required"),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
});

export type CreateUploadInput = z.infer<typeof createUploadSchema>;
