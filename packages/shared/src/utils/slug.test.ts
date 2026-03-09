import { describe, it, expect } from "vitest";

import { generateSlug } from "./slug";

describe("generateSlug", () => {
  it("converts title to lowercase slug", () => {
    expect(generateSlug("My Demo Title")).toBe("my-demo-title");
  });

  it("strips special characters", () => {
    expect(generateSlug("Hello! World?")).toBe("hello-world");
  });

  it("handles unicode characters", () => {
    expect(generateSlug("Uber Demo")).toBe("uber-demo");
  });

  it("handles accented characters", () => {
    expect(generateSlug("cafe resume naive")).toBe("cafe-resume-naive");
  });

  it("collapses multiple spaces", () => {
    expect(generateSlug("hello   world")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("hello---world")).toBe("hello-world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(generateSlug("  hello world  ")).toBe("hello-world");
  });

  it("removes leading and trailing hyphens", () => {
    expect(generateSlug("-hello world-")).toBe("hello-world");
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("returns empty string for only special characters", () => {
    expect(generateSlug("!@#$%^&*()")).toBe("");
  });

  it("handles underscores as separators", () => {
    expect(generateSlug("hello_world_test")).toBe("hello-world-test");
  });

  it("handles mixed case", () => {
    expect(generateSlug("MyDemoTitle")).toBe("mydemotitle");
  });

  it("handles numbers", () => {
    expect(generateSlug("Demo 2024 Version 3")).toBe("demo-2024-version-3");
  });
});
