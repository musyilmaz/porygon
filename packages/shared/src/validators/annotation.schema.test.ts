import { describe, it, expect } from "vitest";

import { createAnnotationSchema } from "./annotation.schema";

describe("createAnnotationSchema", () => {
  it("accepts valid blur annotation", () => {
    const result = createAnnotationSchema.safeParse({
      stepId: "step_123",
      type: "blur",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid highlight annotation with settings", () => {
    const result = createAnnotationSchema.safeParse({
      stepId: "step_123",
      type: "highlight",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      settings: {
        highlightColor: "#ffcc00",
        highlightOpacity: 0.5,
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts crop annotation", () => {
    const result = createAnnotationSchema.safeParse({
      stepId: "step_123",
      type: "crop",
      x: 0,
      y: 0,
      width: 200,
      height: 150,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = createAnnotationSchema.safeParse({
      stepId: "step_123",
      type: "circle",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative dimensions", () => {
    const result = createAnnotationSchema.safeParse({
      stepId: "step_123",
      type: "blur",
      x: 10,
      y: 20,
      width: -100,
      height: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero width", () => {
    const result = createAnnotationSchema.safeParse({
      stepId: "step_123",
      type: "blur",
      x: 10,
      y: 20,
      width: 0,
      height: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing stepId", () => {
    const result = createAnnotationSchema.safeParse({
      type: "blur",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
    expect(result.success).toBe(false);
  });

  it("rejects blur intensity above 100", () => {
    const result = createAnnotationSchema.safeParse({
      stepId: "step_123",
      type: "blur",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      settings: { blurIntensity: 150 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid highlight color", () => {
    const result = createAnnotationSchema.safeParse({
      stepId: "step_123",
      type: "highlight",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      settings: { highlightColor: "yellow" },
    });
    expect(result.success).toBe(false);
  });
});
