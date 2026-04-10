import { describe, it, expect } from "vitest";

import { createHotspotSchema, updateHotspotSchema } from "./hotspot.schema";

describe("createHotspotSchema", () => {
  it("accepts valid input with minimal fields", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 100,
      y: 200,
      width: 50,
      height: 30,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tooltipPosition).toBe("bottom");
      expect(result.data.type).toBe("click_zone");
      expect(result.data.openByDefault).toBe(false);
    }
  });

  it("accepts valid input with all fields", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 100,
      y: 200,
      width: 50,
      height: 30,
      targetStepId: "step_456",
      tooltipContent: { type: "doc", content: [] },
      tooltipPosition: "top",
      style: {
        borderColor: "#ff0000",
        borderWidth: 2,
        backgroundColor: "#00ff00",
        opacity: 0.8,
        pulseAnimation: true,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing stepId", () => {
    const result = createHotspotSchema.safeParse({
      x: 100,
      y: 200,
      width: 50,
      height: 30,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero width", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 100,
      y: 200,
      width: 0,
      height: 30,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative height", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 100,
      y: 200,
      width: 50,
      height: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tooltip position", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 100,
      y: 200,
      width: 50,
      height: 30,
      tooltipPosition: "center",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid hex color in style", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 100,
      y: 200,
      width: 50,
      height: 30,
      style: { borderColor: "rgb(255,0,0)" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects opacity greater than 1", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 100,
      y: 200,
      width: 50,
      height: 30,
      style: { opacity: 1.5 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects borderWidth greater than 10", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 100,
      y: 200,
      width: 50,
      height: 30,
      style: { borderWidth: 15 },
    });
    expect(result.success).toBe(false);
  });

  it("accepts null targetStepId", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      targetStepId: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all hotspot types", () => {
    for (const type of ["click_zone", "area", "callout"]) {
      const result = createHotspotSchema.safeParse({
        stepId: "step_123",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        type,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid hotspot type", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      type: "tooltip",
    });
    expect(result.success).toBe(false);
  });

  it("accepts openByDefault true", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      openByDefault: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.openByDefault).toBe(true);
    }
  });

  it("accepts area style fields", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      type: "area",
      style: {
        overlayColor: "#ff0000",
        overlayOpacity: 0.5,
        shape: "rounded",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid shape", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      style: { shape: "circle" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts callout style fields", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      type: "callout",
      style: {
        pointerDirection: "top-left",
        showButton: true,
        buttonText: "Next",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid pointer direction", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      style: { pointerDirection: "center" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid overlay hex color", () => {
    const result = createHotspotSchema.safeParse({
      stepId: "step_123",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      style: { overlayColor: "red" },
    });
    expect(result.success).toBe(false);
  });
});

describe("updateHotspotSchema", () => {
  it("accepts partial update", () => {
    const result = updateHotspotSchema.safeParse({ x: 50, y: 75 });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateHotspotSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("does not allow stepId in update", () => {
    const result = updateHotspotSchema.safeParse({ stepId: "step_new" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("stepId" in result.data).toBe(false);
    }
  });
});
