import { describe, it, expect } from "vitest";

import { createStepSchema, updateStepSchema } from "./step.schema";

describe("createStepSchema", () => {
  it("accepts valid input", () => {
    const result = createStepSchema.safeParse({
      demoId: "demo_123",
      orderIndex: 0,
      screenshotUrl: "https://cdn.example.com/screenshot.png",
      actionType: "click",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with coordinates", () => {
    const result = createStepSchema.safeParse({
      demoId: "demo_123",
      orderIndex: 1,
      screenshotUrl: "https://cdn.example.com/screenshot.png",
      actionType: "click",
      actionCoordinates: { x: 100, y: 200 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts null coordinates", () => {
    const result = createStepSchema.safeParse({
      demoId: "demo_123",
      orderIndex: 0,
      screenshotUrl: "https://cdn.example.com/screenshot.png",
      actionType: "navigation",
      actionCoordinates: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing demoId", () => {
    const result = createStepSchema.safeParse({
      orderIndex: 0,
      screenshotUrl: "https://cdn.example.com/screenshot.png",
      actionType: "click",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid screenshot URL", () => {
    const result = createStepSchema.safeParse({
      demoId: "demo_123",
      orderIndex: 0,
      screenshotUrl: "not-a-url",
      actionType: "click",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid action type", () => {
    const result = createStepSchema.safeParse({
      demoId: "demo_123",
      orderIndex: 0,
      screenshotUrl: "https://cdn.example.com/screenshot.png",
      actionType: "hover",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative orderIndex", () => {
    const result = createStepSchema.safeParse({
      demoId: "demo_123",
      orderIndex: -1,
      screenshotUrl: "https://cdn.example.com/screenshot.png",
      actionType: "click",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative coordinates", () => {
    const result = createStepSchema.safeParse({
      demoId: "demo_123",
      orderIndex: 0,
      screenshotUrl: "https://cdn.example.com/screenshot.png",
      actionType: "click",
      actionCoordinates: { x: -10, y: 200 },
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid action types", () => {
    for (const actionType of ["click", "scroll", "type", "navigation"]) {
      const result = createStepSchema.safeParse({
        demoId: "demo_123",
        orderIndex: 0,
        screenshotUrl: "https://cdn.example.com/screenshot.png",
        actionType,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("updateStepSchema", () => {
  it("accepts partial update", () => {
    const result = updateStepSchema.safeParse({ orderIndex: 5 });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateStepSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid screenshot URL", () => {
    const result = updateStepSchema.safeParse({ screenshotUrl: "bad" });
    expect(result.success).toBe(false);
  });
});
