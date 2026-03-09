import { describe, it, expect } from "vitest";

import { createDemoSchema, updateDemoSchema } from "./demo.schema";

describe("createDemoSchema", () => {
  it("accepts valid input", () => {
    const result = createDemoSchema.safeParse({
      title: "My Demo",
      workspaceId: "ws_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with optional description", () => {
    const result = createDemoSchema.safeParse({
      title: "My Demo",
      workspaceId: "ws_abc123",
      description: "A test demo",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null description", () => {
    const result = createDemoSchema.safeParse({
      title: "My Demo",
      workspaceId: "ws_abc123",
      description: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createDemoSchema.safeParse({
      title: "",
      workspaceId: "ws_abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title over 200 characters", () => {
    const result = createDemoSchema.safeParse({
      title: "a".repeat(201),
      workspaceId: "ws_abc123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts title at exactly 200 characters", () => {
    const result = createDemoSchema.safeParse({
      title: "a".repeat(200),
      workspaceId: "ws_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing workspaceId", () => {
    const result = createDemoSchema.safeParse({
      title: "My Demo",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty workspaceId", () => {
    const result = createDemoSchema.safeParse({
      title: "My Demo",
      workspaceId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description over 2000 characters", () => {
    const result = createDemoSchema.safeParse({
      title: "My Demo",
      workspaceId: "ws_abc123",
      description: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateDemoSchema", () => {
  it("accepts partial update with title only", () => {
    const result = updateDemoSchema.safeParse({ title: "New Title" });
    expect(result.success).toBe(true);
  });

  it("accepts update with valid status", () => {
    const result = updateDemoSchema.safeParse({ status: "published" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateDemoSchema.safeParse({ status: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts valid settings", () => {
    const result = updateDemoSchema.safeParse({
      settings: {
        showProgressBar: true,
        autoPlay: false,
        autoPlayDelay: 3000,
        brandColor: "#ff5500",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid hex color in settings", () => {
    const result = updateDemoSchema.safeParse({
      settings: { brandColor: "red" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects autoPlayDelay below 500", () => {
    const result = updateDemoSchema.safeParse({
      settings: { autoPlayDelay: 100 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects autoPlayDelay above 10000", () => {
    const result = updateDemoSchema.safeParse({
      settings: { autoPlayDelay: 15000 },
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty object (no changes)", () => {
    const result = updateDemoSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
