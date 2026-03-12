import { describe, it, expect } from "vitest";

import { recordViewSchema, updateViewSchema } from "./analytics.schema";

describe("recordViewSchema", () => {
  it("accepts valid input with required fields only", () => {
    const result = recordViewSchema.safeParse({
      demoId: "demo_abc123",
      viewerHash: "hash_xyz",
      totalSteps: 5,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with all optional fields", () => {
    const result = recordViewSchema.safeParse({
      demoId: "demo_abc123",
      viewerHash: "hash_xyz",
      totalSteps: 3,
      referrer: "https://example.com",
      userAgent: "Mozilla/5.0",
      country: "US",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null optional fields", () => {
    const result = recordViewSchema.safeParse({
      demoId: "demo_abc123",
      viewerHash: "hash_xyz",
      totalSteps: 1,
      referrer: null,
      userAgent: null,
      country: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing demoId", () => {
    const result = recordViewSchema.safeParse({
      viewerHash: "hash_xyz",
      totalSteps: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty demoId", () => {
    const result = recordViewSchema.safeParse({
      demoId: "",
      viewerHash: "hash_xyz",
      totalSteps: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing viewerHash", () => {
    const result = recordViewSchema.safeParse({
      demoId: "demo_abc123",
      totalSteps: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty viewerHash", () => {
    const result = recordViewSchema.safeParse({
      demoId: "demo_abc123",
      viewerHash: "",
      totalSteps: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects totalSteps less than 1", () => {
    const result = recordViewSchema.safeParse({
      demoId: "demo_abc123",
      viewerHash: "hash_xyz",
      totalSteps: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer totalSteps", () => {
    const result = recordViewSchema.safeParse({
      demoId: "demo_abc123",
      viewerHash: "hash_xyz",
      totalSteps: 2.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing totalSteps", () => {
    const result = recordViewSchema.safeParse({
      demoId: "demo_abc123",
      viewerHash: "hash_xyz",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateViewSchema", () => {
  it("accepts empty object (no changes)", () => {
    const result = updateViewSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts stepsViewed update", () => {
    const result = updateViewSchema.safeParse({ stepsViewed: 3 });
    expect(result.success).toBe(true);
  });

  it("accepts stepsViewed of 0", () => {
    const result = updateViewSchema.safeParse({ stepsViewed: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects negative stepsViewed", () => {
    const result = updateViewSchema.safeParse({ stepsViewed: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer stepsViewed", () => {
    const result = updateViewSchema.safeParse({ stepsViewed: 1.5 });
    expect(result.success).toBe(false);
  });

  it("accepts completed boolean", () => {
    const result = updateViewSchema.safeParse({ completed: true });
    expect(result.success).toBe(true);
  });

  it("accepts completedAt as ISO string (coerced to Date)", () => {
    const result = updateViewSchema.safeParse({
      completedAt: "2025-01-15T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completedAt).toBeInstanceOf(Date);
    }
  });

  it("accepts null completedAt", () => {
    const result = updateViewSchema.safeParse({ completedAt: null });
    expect(result.success).toBe(true);
  });

  it("accepts all fields together", () => {
    const result = updateViewSchema.safeParse({
      stepsViewed: 5,
      completed: true,
      completedAt: "2025-01-15T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid completedAt string", () => {
    const result = updateViewSchema.safeParse({
      completedAt: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});
