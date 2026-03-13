// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { PlayerConfig } from "../types";

import { DemoPlayerRenderer } from "./renderer";
import { _resetStyleState } from "./styles";

// jsdom lacks ResizeObserver
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

function makeConfig(overrides: Partial<PlayerConfig> = {}): PlayerConfig {
  return {
    id: "demo-1",
    title: "Test Demo",
    description: null,
    slug: "test-demo",
    settings: {
      showNavigation: true,
      showProgressBar: true,
      autoPlay: false,
      autoPlayDelay: 3000,
      brandColor: "#4f46e5",
    },
    steps: [
      {
        id: "step-1",
        orderIndex: 0,
        screenshotUrl: "https://example.com/step1.png",
        actionType: "click",
        actionCoordinates: { x: 100, y: 200 },
        hotspots: [
          {
            id: "hs-1",
            x: 100,
            y: 200,
            width: 50,
            height: 30,
            targetStepId: "step-2",
            tooltipContent: null,
            tooltipPosition: "top",
            style: {
              borderColor: "#ff0000",
              borderWidth: 2,
              pulseAnimation: false,
            },
          },
        ],
        annotations: [],
      },
      {
        id: "step-2",
        orderIndex: 1,
        screenshotUrl: "https://example.com/step2.png",
        actionType: "click",
        actionCoordinates: null,
        hotspots: [],
        annotations: [
          {
            id: "ann-1",
            type: "highlight",
            x: 50,
            y: 100,
            width: 200,
            height: 150,
            settings: { highlightColor: "rgba(255, 255, 0, 0.3)" },
          },
        ],
      },
      {
        id: "step-3",
        orderIndex: 2,
        screenshotUrl: "https://example.com/step3.png",
        actionType: "click",
        actionCoordinates: null,
        hotspots: [],
        annotations: [],
      },
    ],
    ...overrides,
  };
}

function simulateImageLoad(container: HTMLElement): void {
  const img = container.querySelector(
    ".porygon-player-screenshot",
  ) as HTMLImageElement;
  if (!img) return;

  Object.defineProperty(img, "naturalWidth", { value: 1920, configurable: true });
  Object.defineProperty(img, "naturalHeight", { value: 1080, configurable: true });
  img.dispatchEvent(new Event("load"));
}

describe("DemoPlayerRenderer", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    _resetStyleState();
    document.head.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    _resetStyleState();
  });

  it("mounts DOM into container", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    const root = container.querySelector(".porygon-player");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("application");
    expect(root?.getAttribute("aria-label")).toBe(
      "Interactive demo: Test Demo",
    );

    renderer.destroy();
  });

  it("injects styles into document head", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    const style = document.querySelector("[data-porygon-player]");
    expect(style).not.toBeNull();

    renderer.destroy();
  });

  it("removes styles on destroy", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });
    renderer.destroy();

    const style = document.querySelector("[data-porygon-player]");
    expect(style).toBeNull();
  });

  it("removes DOM on destroy", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });
    renderer.destroy();

    expect(container.querySelector(".porygon-player")).toBeNull();
  });

  it("exposes player via getPlayer()", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    const player = renderer.getPlayer();
    expect(player.getState().totalSteps).toBe(3);
    expect(player.getState().currentStepIndex).toBe(0);

    renderer.destroy();
  });

  it("sets initial screenshot src", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    const img = container.querySelector(
      ".porygon-player-screenshot",
    ) as HTMLImageElement;
    expect(img.src).toContain("step1.png");

    renderer.destroy();
  });

  it("shows initial progress text", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    const text = container.querySelector(
      ".porygon-player-progress span",
    );
    expect(text?.textContent).toBe("1 / 3");

    renderer.destroy();
  });

  it("disables prev button on first step", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    const prevBtn = container.querySelector(
      ".porygon-player-prev",
    ) as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);

    renderer.destroy();
  });

  it("navigates forward on next button click", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    simulateImageLoad(container);

    const nextBtn = container.querySelector(
      ".porygon-player-next",
    ) as HTMLButtonElement;
    nextBtn.click();

    const img = container.querySelector(
      ".porygon-player-screenshot",
    ) as HTMLImageElement;
    expect(img.src).toContain("step2.png");

    const text = container.querySelector(
      ".porygon-player-progress span",
    );
    expect(text?.textContent).toBe("2 / 3");

    renderer.destroy();
  });

  it("navigates backward on prev button click", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    simulateImageLoad(container);

    // Go forward then back
    renderer.getPlayer().next();
    simulateImageLoad(container);

    const prevBtn = container.querySelector(
      ".porygon-player-prev",
    ) as HTMLButtonElement;
    prevBtn.click();

    const img = container.querySelector(
      ".porygon-player-screenshot",
    ) as HTMLImageElement;
    expect(img.src).toContain("step1.png");

    renderer.destroy();
  });

  it("renders hotspots after image load", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    simulateImageLoad(container);

    const hotspots = container.querySelectorAll(".porygon-player-hotspot");
    expect(hotspots.length).toBe(1);
    expect(
      (hotspots[0] as HTMLElement).dataset.hotspotId,
    ).toBe("hs-1");

    renderer.destroy();
  });

  it("renders annotations after image load", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    // Navigate to step 2 which has an annotation
    renderer.getPlayer().next();
    simulateImageLoad(container);

    const annotations = container.querySelectorAll(
      ".porygon-player-annotation",
    );
    expect(annotations.length).toBe(1);

    renderer.destroy();
  });

  it("disables next button on complete", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    simulateImageLoad(container);

    const player = renderer.getPlayer();
    player.next(); // step 2
    player.next(); // step 3 (last)
    player.next(); // complete

    const nextBtn = container.querySelector(
      ".porygon-player-next",
    ) as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);

    renderer.destroy();
  });

  it("hides controls when showNavigation is false", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig({
        settings: {
          showNavigation: false,
          showProgressBar: true,
          autoPlay: false,
        },
      }),
    });

    const controls = container.querySelector(
      ".porygon-player-controls",
    ) as HTMLElement;
    expect(controls.style.display).toBe("none");

    renderer.destroy();
  });

  it("hides progress bar when showProgressBar is false", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig({
        settings: {
          showNavigation: true,
          showProgressBar: false,
          autoPlay: false,
        },
      }),
    });

    const bar = container.querySelector(
      ".porygon-player-progress-bar",
    ) as HTMLElement;
    expect(bar.style.display).toBe("none");

    renderer.destroy();
  });

  it("applies custom brand color as CSS variable", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig({
        settings: {
          brandColor: "#ff0000",
          showNavigation: true,
          showProgressBar: true,
          autoPlay: false,
        },
      }),
    });

    const root = container.querySelector(".porygon-player") as HTMLElement;
    expect(root.style.getPropertyValue("--porygon-brand-color")).toBe(
      "#ff0000",
    );

    renderer.destroy();
  });

  it("keyboard ArrowRight triggers next", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    simulateImageLoad(container);

    const root = container.querySelector(".porygon-player") as HTMLElement;
    root.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    expect(renderer.getPlayer().getState().currentStepIndex).toBe(1);

    renderer.destroy();
  });

  it("keyboard ArrowLeft triggers previous", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    simulateImageLoad(container);

    renderer.getPlayer().next();
    simulateImageLoad(container);

    const root = container.querySelector(".porygon-player") as HTMLElement;
    root.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
    );

    expect(renderer.getPlayer().getState().currentStepIndex).toBe(0);

    renderer.destroy();
  });

  it("hotspot click navigates branch when no tooltip", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });

    simulateImageLoad(container);

    const hotspotEl = container.querySelector(
      ".porygon-player-hotspot",
    ) as HTMLElement;
    hotspotEl.click();

    expect(renderer.getPlayer().getState().currentStepIndex).toBe(1);

    renderer.destroy();
  });

  it("hotspot click shows tooltip when tooltipContent exists", () => {
    const config = makeConfig();
    config.steps[0]!.hotspots[0]!.tooltipContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello tooltip" }],
        },
      ],
    };
    config.steps[0]!.hotspots[0]!.targetStepId = null;

    const renderer = new DemoPlayerRenderer({ container, config });

    simulateImageLoad(container);

    const hotspotEl = container.querySelector(
      ".porygon-player-hotspot",
    ) as HTMLElement;
    hotspotEl.click();

    const tooltip = container.querySelector(
      ".porygon-player-tooltip",
    ) as HTMLElement;
    expect(
      tooltip.classList.contains("porygon-player-tooltip--hidden"),
    ).toBe(false);
    expect(tooltip.innerHTML).toContain("Hello tooltip");

    renderer.destroy();
  });

  it("Escape hides tooltip", () => {
    const config = makeConfig();
    config.steps[0]!.hotspots[0]!.tooltipContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Tooltip" }],
        },
      ],
    };
    config.steps[0]!.hotspots[0]!.targetStepId = null;

    const renderer = new DemoPlayerRenderer({ container, config });

    simulateImageLoad(container);

    // Show tooltip
    const hotspotEl = container.querySelector(
      ".porygon-player-hotspot",
    ) as HTMLElement;
    hotspotEl.click();

    // Press Escape
    const root = container.querySelector(".porygon-player") as HTMLElement;
    root.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );

    const tooltip = container.querySelector(
      ".porygon-player-tooltip",
    ) as HTMLElement;
    expect(
      tooltip.classList.contains("porygon-player-tooltip--hidden"),
    ).toBe(true);

    renderer.destroy();
  });

  it("destroy is idempotent", () => {
    const renderer = new DemoPlayerRenderer({
      container,
      config: makeConfig(),
    });
    renderer.destroy();
    renderer.destroy(); // should not throw
  });

  describe("autoplay", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("auto-advances steps when autoPlay is enabled", () => {
      const renderer = new DemoPlayerRenderer({
        container,
        config: makeConfig({
          settings: {
            showNavigation: true,
            showProgressBar: true,
            autoPlay: true,
            autoPlayDelay: 2000,
          },
        }),
      });

      simulateImageLoad(container);

      vi.advanceTimersByTime(2000);
      expect(renderer.getPlayer().getState().currentStepIndex).toBe(1);

      renderer.destroy();
    });

    it("pauses on mouseenter and resumes on mouseleave", () => {
      const renderer = new DemoPlayerRenderer({
        container,
        config: makeConfig({
          settings: {
            showNavigation: true,
            showProgressBar: true,
            autoPlay: true,
            autoPlayDelay: 2000,
          },
        }),
      });

      simulateImageLoad(container);

      const root = container.querySelector(".porygon-player") as HTMLElement;

      root.dispatchEvent(new MouseEvent("mouseenter"));
      vi.advanceTimersByTime(3000);
      expect(renderer.getPlayer().getState().currentStepIndex).toBe(0);

      root.dispatchEvent(new MouseEvent("mouseleave"));
      vi.advanceTimersByTime(2000);
      expect(renderer.getPlayer().getState().currentStepIndex).toBe(1);

      renderer.destroy();
    });

    it("stops autoplay on complete", () => {
      const config = makeConfig({
        settings: {
          showNavigation: true,
          showProgressBar: true,
          autoPlay: true,
          autoPlayDelay: 1000,
        },
      });
      // Use only 2 steps for faster complete
      config.steps = config.steps.slice(0, 2);

      const renderer = new DemoPlayerRenderer({ container, config });

      simulateImageLoad(container);

      // First tick advances to step 2
      vi.advanceTimersByTime(1000);
      simulateImageLoad(container);
      expect(renderer.getPlayer().getState().currentStepIndex).toBe(1);

      // Next tick triggers complete
      vi.advanceTimersByTime(1000);
      expect(renderer.getPlayer().getState().isComplete).toBe(true);

      // Further ticks should not cause errors
      vi.advanceTimersByTime(5000);

      renderer.destroy();
    });
  });
});
