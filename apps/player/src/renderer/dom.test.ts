// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

import type { PlayerAnnotation, PlayerHotspot } from "../types";

import {
  createPlayerDOM,
  createHotspotElement,
  createAnnotationElement,
} from "./dom";

function makeHotspot(overrides: Partial<PlayerHotspot> = {}): PlayerHotspot {
  return {
    id: "hotspot-1",
    x: 100,
    y: 200,
    width: 50,
    height: 30,
    targetStepId: null,
    tooltipContent: null,
    tooltipPosition: "top",
    style: {
      borderColor: "#ff0000",
      borderWidth: 2,
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      opacity: 0.9,
      pulseAnimation: false,
    },
    ...overrides,
  };
}

function makeAnnotation(
  overrides: Partial<PlayerAnnotation> = {},
): PlayerAnnotation {
  return {
    id: "annotation-1",
    type: "highlight",
    x: 50,
    y: 100,
    width: 200,
    height: 150,
    settings: {
      highlightColor: "rgba(255, 255, 0, 0.3)",
      highlightOpacity: 0.5,
    },
    ...overrides,
  };
}

describe("createPlayerDOM", () => {
  it("creates root element with correct class and attributes", () => {
    const dom = createPlayerDOM("Test Demo");
    expect(dom.root.className).toBe("porygon-player");
    expect(dom.root.tabIndex).toBe(0);
    expect(dom.root.getAttribute("role")).toBe("application");
    expect(dom.root.getAttribute("aria-label")).toBe(
      "Interactive demo: Test Demo",
    );
  });

  it("creates viewport with screenshot and layers", () => {
    const dom = createPlayerDOM("Test");
    expect(dom.viewport.className).toBe("porygon-player-viewport");
    expect(dom.screenshot.tagName).toBe("IMG");
    expect(dom.screenshot.className).toBe("porygon-player-screenshot");
    expect(dom.annotationLayer.className).toBe(
      "porygon-player-annotation-layer",
    );
    expect(dom.hotspotLayer.className).toBe("porygon-player-hotspot-layer");

    // Correct parent-child relationships
    expect(dom.viewport.contains(dom.screenshot)).toBe(true);
    expect(dom.viewport.contains(dom.annotationLayer)).toBe(true);
    expect(dom.viewport.contains(dom.hotspotLayer)).toBe(true);
  });

  it("creates tooltip with hidden class and role", () => {
    const dom = createPlayerDOM("Test");
    expect(dom.tooltip.getAttribute("role")).toBe("tooltip");
    expect(dom.tooltip.classList.contains("porygon-player-tooltip--hidden")).toBe(
      true,
    );
  });

  it("creates controls with prev/next buttons and progress", () => {
    const dom = createPlayerDOM("Test");
    expect(dom.controls.className).toBe("porygon-player-controls");
    expect(dom.prevButton.tagName).toBe("BUTTON");
    expect(dom.nextButton.tagName).toBe("BUTTON");
    expect(dom.prevButton.getAttribute("aria-label")).toBe("Previous step");
    expect(dom.nextButton.getAttribute("aria-label")).toBe("Next step");
    expect(dom.prevButton.type).toBe("button");
    expect(dom.nextButton.type).toBe("button");
  });

  it("creates progress bar elements", () => {
    const dom = createPlayerDOM("Test");
    expect(dom.progressBar.className).toBe("porygon-player-progress-bar");
    expect(dom.progressFill.className).toBe("porygon-player-progress-fill");
    expect(dom.progressBar.contains(dom.progressFill)).toBe(true);
  });

  it("contains SVG icons in buttons", () => {
    const dom = createPlayerDOM("Test");
    expect(dom.prevButton.querySelector("svg")).not.toBeNull();
    expect(dom.nextButton.querySelector("svg")).not.toBeNull();
  });

  it("assembles full DOM hierarchy", () => {
    const dom = createPlayerDOM("Test");
    expect(dom.root.contains(dom.viewport)).toBe(true);
    expect(dom.root.contains(dom.tooltip)).toBe(true);
    expect(dom.root.contains(dom.controls)).toBe(true);
  });
});

describe("createHotspotElement", () => {
  it("creates a positioned div with percentage coordinates", () => {
    const hotspot = makeHotspot();
    const el = createHotspotElement(hotspot, 1000, 800);

    expect(el.style.left).toBe("10%");
    expect(el.style.top).toBe("25%");
    expect(el.style.width).toBe("5%");
    expect(el.style.height).toBe("3.75%");
  });

  it("sets data-hotspot-id attribute", () => {
    const hotspot = makeHotspot({ id: "hs-42" });
    const el = createHotspotElement(hotspot, 1000, 800);
    expect(el.dataset.hotspotId).toBe("hs-42");
  });

  it("applies accessibility attributes", () => {
    const hotspot = makeHotspot();
    const el = createHotspotElement(hotspot, 1000, 800);
    expect(el.getAttribute("role")).toBe("button");
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("applies style properties from hotspot style", () => {
    const hotspot = makeHotspot({
      style: {
        borderColor: "#0000ff",
        borderWidth: 3,
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        opacity: 0.7,
        pulseAnimation: false,
      },
    });
    const el = createHotspotElement(hotspot, 1000, 800);

    expect(el.style.borderColor).toBe("rgb(0, 0, 255)");
    expect(el.style.borderWidth).toBe("3px");
    expect(el.style.backgroundColor).toBe("rgba(0, 0, 255, 0.2)");
    expect(el.style.opacity).toBe("0.7");
  });

  it("adds pulse class when pulseAnimation is true", () => {
    const hotspot = makeHotspot({
      style: { pulseAnimation: true },
    });
    const el = createHotspotElement(hotspot, 1000, 800);
    expect(el.classList.contains("porygon-player-hotspot--pulse")).toBe(true);
  });

  it("does not add pulse class when pulseAnimation is false", () => {
    const hotspot = makeHotspot({
      style: { pulseAnimation: false },
    });
    const el = createHotspotElement(hotspot, 1000, 800);
    expect(el.classList.contains("porygon-player-hotspot--pulse")).toBe(false);
  });

  it("defaults borderWidth to 2px when not specified", () => {
    const hotspot = makeHotspot({ style: {} });
    const el = createHotspotElement(hotspot, 1000, 800);
    expect(el.style.borderWidth).toBe("2px");
  });
});

describe("createAnnotationElement", () => {
  it("creates a positioned div with percentage coordinates", () => {
    const annotation = makeAnnotation();
    const el = createAnnotationElement(annotation, 1000, 800);

    expect(el.style.left).toBe("5%");
    expect(el.style.top).toBe("12.5%");
    expect(el.style.width).toBe("20%");
    expect(el.style.height).toBe("18.75%");
  });

  it("sets data-annotation-id attribute", () => {
    const annotation = makeAnnotation({ id: "ann-7" });
    const el = createAnnotationElement(annotation, 1000, 800);
    expect(el.dataset.annotationId).toBe("ann-7");
  });

  it("applies highlight styles", () => {
    const annotation = makeAnnotation({
      type: "highlight",
      settings: { highlightColor: "#ff0", highlightOpacity: 0.6 },
    });
    const el = createAnnotationElement(annotation, 1000, 800);

    expect(el.classList.contains("porygon-player-annotation--highlight")).toBe(
      true,
    );
    expect(el.style.backgroundColor).toBe("rgb(255, 255, 0)");
    expect(el.style.opacity).toBe("0.6");
  });

  it("applies blur styles with custom intensity", () => {
    const annotation = makeAnnotation({
      type: "blur",
      settings: { blurIntensity: 12 },
    });
    const el = createAnnotationElement(annotation, 1000, 800);

    expect(el.classList.contains("porygon-player-annotation--blur")).toBe(true);
    expect(el.style.backdropFilter).toBe("blur(12px)");
  });

  it("defaults blur intensity to 8px", () => {
    const annotation = makeAnnotation({
      type: "blur",
      settings: {},
    });
    const el = createAnnotationElement(annotation, 1000, 800);
    expect(el.style.backdropFilter).toBe("blur(8px)");
  });
});
