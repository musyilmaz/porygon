import { describe, it, expect } from "vitest";

import { createWorkspaceSchema, updateWorkspaceSchema } from "./workspace.schema";

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
