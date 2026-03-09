import { describe, it, expect } from "vitest";

import { generateId } from "./id";

describe("generateId", () => {
  it("returns a string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
  });

  it("returns a non-empty string", () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("generates URL-safe IDs", () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});
