import { describe, it, expect } from "vitest";

import { toPercent, hotspotToPercentStyles } from "./scaling";

describe("toPercent", () => {
  it("converts pixel value to percentage of natural size", () => {
    expect(toPercent(100, 1000)).toBe(10);
  });

  it("returns 0 when natural size is 0", () => {
    expect(toPercent(100, 0)).toBe(0);
  });

  it("returns 0 when natural size is negative", () => {
    expect(toPercent(100, -500)).toBe(0);
  });

  it("handles value of 0", () => {
    expect(toPercent(0, 1000)).toBe(0);
  });

  it("returns 100 when value equals natural size", () => {
    expect(toPercent(800, 800)).toBe(100);
  });

  it("handles fractional results", () => {
    expect(toPercent(1, 3)).toBeCloseTo(33.3333, 3);
  });
});

describe("hotspotToPercentStyles", () => {
  it("converts pixel dimensions to percentage strings", () => {
    const result = hotspotToPercentStyles(
      { x: 100, y: 200, width: 50, height: 30 },
      1000,
      800,
    );

    expect(result).toEqual({
      left: "10%",
      top: "25%",
      width: "5%",
      height: "3.75%",
    });
  });

  it("handles zero-size natural dimensions", () => {
    const result = hotspotToPercentStyles(
      { x: 100, y: 200, width: 50, height: 30 },
      0,
      0,
    );

    expect(result).toEqual({
      left: "0%",
      top: "0%",
      width: "0%",
      height: "0%",
    });
  });

  it("handles hotspot at origin", () => {
    const result = hotspotToPercentStyles(
      { x: 0, y: 0, width: 100, height: 100 },
      1000,
      1000,
    );

    expect(result).toEqual({
      left: "0%",
      top: "0%",
      width: "10%",
      height: "10%",
    });
  });
});
