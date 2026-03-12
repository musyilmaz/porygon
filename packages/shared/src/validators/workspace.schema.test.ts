import { describe, it, expect } from "vitest";

import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from "./workspace.schema";

describe("createWorkspaceSchema", () => {
  it("accepts valid input", () => {
    const result = createWorkspaceSchema.safeParse({ name: "My Workspace" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createWorkspaceSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    const result = createWorkspaceSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 100 characters", () => {
    const result = createWorkspaceSchema.safeParse({ name: "a".repeat(100) });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = createWorkspaceSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateWorkspaceSchema", () => {
  it("accepts name update", () => {
    const result = updateWorkspaceSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("accepts slug update", () => {
    const result = updateWorkspaceSchema.safeParse({ slug: "new-slug" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug with uppercase", () => {
    const result = updateWorkspaceSchema.safeParse({ slug: "Invalid-Slug" });
    expect(result.success).toBe(false);
  });

  it("rejects slug with special characters", () => {
    const result = updateWorkspaceSchema.safeParse({ slug: "my_slug!" });
    expect(result.success).toBe(false);
  });

  it("rejects slug with consecutive hyphens", () => {
    const result = updateWorkspaceSchema.safeParse({ slug: "my--slug" });
    expect(result.success).toBe(false);
  });

  it("rejects slug starting with hyphen", () => {
    const result = updateWorkspaceSchema.safeParse({ slug: "-my-slug" });
    expect(result.success).toBe(false);
  });

  it("rejects slug ending with hyphen", () => {
    const result = updateWorkspaceSchema.safeParse({ slug: "my-slug-" });
    expect(result.success).toBe(false);
  });

  it("accepts slug with numbers", () => {
    const result = updateWorkspaceSchema.safeParse({ slug: "workspace-123" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateWorkspaceSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("addMemberSchema", () => {
  it("accepts valid input with role", () => {
    const result = addMemberSchema.safeParse({ userId: "user_1", role: "viewer" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ userId: "user_1", role: "viewer" });
  });

  it("defaults role to editor when omitted", () => {
    const result = addMemberSchema.safeParse({ userId: "user_1" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ userId: "user_1", role: "editor" });
  });

  it("rejects missing userId", () => {
    const result = addMemberSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty userId", () => {
    const result = addMemberSchema.safeParse({ userId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = addMemberSchema.safeParse({ userId: "user_1", role: "superadmin" });
    expect(result.success).toBe(false);
  });
});

describe("updateMemberRoleSchema", () => {
  it("accepts valid role", () => {
    const result = updateMemberRoleSchema.safeParse({ role: "admin" });
    expect(result.success).toBe(true);
  });

  it("accepts all valid roles", () => {
    for (const role of ["admin", "editor", "viewer"]) {
      const result = updateMemberRoleSchema.safeParse({ role });
      expect(result.success).toBe(true);
    }
  });

  it("rejects missing role", () => {
    const result = updateMemberRoleSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = updateMemberRoleSchema.safeParse({ role: "owner" });
    expect(result.success).toBe(false);
  });
});
