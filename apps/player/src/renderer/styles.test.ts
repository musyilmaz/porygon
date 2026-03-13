// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";

import {
  generateCSS,
  injectStyles,
  removeStyles,
  _resetStyleState,
} from "./styles";

beforeEach(() => {
  _resetStyleState();
  document.head.innerHTML = "";
});

describe("generateCSS", () => {
  it("returns a non-empty CSS string", () => {
    const css = generateCSS();
    expect(css.length).toBeGreaterThan(0);
  });

  it("includes the default brand color", () => {
    const css = generateCSS();
    expect(css).toContain("#4f46e5");
  });

  it("uses custom brand color", () => {
    const css = generateCSS("#ff0000");
    expect(css).toContain("#ff0000");
    expect(css).not.toContain("#4f46e5");
  });

  it("includes porygon-player class selectors", () => {
    const css = generateCSS();
    expect(css).toContain(".porygon-player");
    expect(css).toContain(".porygon-player-viewport");
    expect(css).toContain(".porygon-player-controls");
    expect(css).toContain(".porygon-player-hotspot");
    expect(css).toContain(".porygon-player-tooltip");
  });

  it("includes pulse keyframes", () => {
    const css = generateCSS();
    expect(css).toContain("@keyframes porygon-pulse");
  });

  it("includes backdrop-filter with webkit prefix", () => {
    const css = generateCSS();
    expect(css).toContain("backdrop-filter");
    expect(css).toContain("-webkit-backdrop-filter");
  });
});

describe("injectStyles / removeStyles", () => {
  it("injects a style element into head", () => {
    injectStyles();
    const style = document.querySelector("[data-porygon-player]");
    expect(style).not.toBeNull();
    expect(style?.tagName).toBe("STYLE");
    removeStyles();
  });

  it("removes style element on last removeStyles call", () => {
    injectStyles();
    removeStyles();
    const style = document.querySelector("[data-porygon-player]");
    expect(style).toBeNull();
  });

  it("reference counts multiple inject/remove pairs", () => {
    injectStyles();
    injectStyles();

    // Only one style element
    const styles = document.querySelectorAll("[data-porygon-player]");
    expect(styles.length).toBe(1);

    // First remove doesn't delete it
    removeStyles();
    expect(document.querySelector("[data-porygon-player]")).not.toBeNull();

    // Second remove deletes it
    removeStyles();
    expect(document.querySelector("[data-porygon-player]")).toBeNull();
  });

  it("passes brand color to generated CSS", () => {
    injectStyles("#00ff00");
    const style = document.querySelector("[data-porygon-player]");
    expect(style?.textContent).toContain("#00ff00");
    removeStyles();
  });
});
