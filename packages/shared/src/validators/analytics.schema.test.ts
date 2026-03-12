import { describe, it, expect } from "vitest";

import {
  analyticsQuerySchema,
  recordViewSchema,
  updateViewSchema,
} from "./analytics.schema";

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

describe("analyticsQuerySchema", () => {
  it("accepts empty object (all-time)", () => {
    const result = analyticsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts from and to as ISO strings", () => {
    const result = analyticsQuerySchema.safeParse({
      from: "2025-01-01",
      to: "2025-01-31",
    });
    expect(result.success).toBe(true);
    expect(result.data!.from).toBeInstanceOf(Date);
    expect(result.data!.to).toBeInstanceOf(Date);
  });

  it("coerces ISO datetime strings to Date", () => {
    const result = analyticsQuerySchema.safeParse({
      from: "2025-06-15T10:30:00Z",
      to: "2025-06-20T23:59:59Z",
    });
    expect(result.success).toBe(true);
    expect(result.data!.from!.toISOString()).toBe("2025-06-15T10:30:00.000Z");
    expect(result.data!.to!.toISOString()).toBe("2025-06-20T23:59:59.000Z");
  });

  it("accepts only from without to", () => {
    const result = analyticsQuerySchema.safeParse({ from: "2025-01-01" });
    expect(result.success).toBe(true);
    expect(result.data!.from).toBeInstanceOf(Date);
    expect(result.data!.to).toBeUndefined();
  });

  it("accepts days as a string (coerced to number)", () => {
    const result = analyticsQuerySchema.safeParse({ days: "7" });
    expect(result.success).toBe(true);
    expect(result.data!.days).toBe(7);
  });

  it("accepts days as a number", () => {
    const result = analyticsQuerySchema.safeParse({ days: 30 });
    expect(result.success).toBe(true);
    expect(result.data!.days).toBe(30);
  });

  it("rejects days less than 1", () => {
    const result = analyticsQuerySchema.safeParse({ days: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative days", () => {
    const result = analyticsQuerySchema.safeParse({ days: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer days", () => {
    const result = analyticsQuerySchema.safeParse({ days: 7.5 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date strings", () => {
    const result = analyticsQuerySchema.safeParse({ from: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("accepts from + to + days together", () => {
    const result = analyticsQuerySchema.safeParse({
      from: "2025-01-01",
      to: "2025-01-31",
      days: 30,
    });
    expect(result.success).toBe(true);
  });
});
