import { describe, it, expect } from "vitest";

describe("shared utils", () => {
  it("should verify test setup works", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle string operations", () => {
    const str = "porygon";
    expect(str).toHaveLength(7);
    expect(str.toUpperCase()).toBe("PORYGON");
  });
});
