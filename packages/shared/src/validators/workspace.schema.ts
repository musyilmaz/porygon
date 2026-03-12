import { z } from "zod";

import { SLUG } from "../constants/patterns";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(SLUG, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["admin", "editor", "viewer"]).default("editor"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "editor", "viewer"]),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
