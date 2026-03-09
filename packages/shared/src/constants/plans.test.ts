import { describe, it, expect } from "vitest";

import { PLAN_LIMITS } from "./plans";

describe("PLAN_LIMITS", () => {
  it("defines limits for all plans", () => {
    expect(Object.keys(PLAN_LIMITS)).toEqual([
      "free",
      "pro",
      "team",
      "business",
    ]);
  });

  it("free plan has 10 max demos", () => {
    expect(PLAN_LIMITS.free.maxDemos).toBe(10);
  });

  it("free plan disables custom branding", () => {
    expect(PLAN_LIMITS.free.customBranding).toBe(false);
  });

  it("pro plan enables custom branding", () => {
    expect(PLAN_LIMITS.pro.customBranding).toBe(true);
  });

  it("business plan has unlimited demos (-1)", () => {
    expect(PLAN_LIMITS.business.maxDemos).toBe(-1);
  });

  it("each plan has all required fields", () => {
    for (const plan of Object.values(PLAN_LIMITS)) {
      expect(plan).toHaveProperty("maxDemos");
      expect(plan).toHaveProperty("maxStepsPerDemo");
      expect(plan).toHaveProperty("maxWorkspaceMembers");
      expect(plan).toHaveProperty("maxStorageMB");
      expect(plan).toHaveProperty("customBranding");
      expect(plan).toHaveProperty("analyticsRetentionDays");
    }
  });
});
