import { PlayerAnalytics } from "../analytics";
import { DemoPlayer } from "../player";
import type { PlayerConfig, PlayerStep } from "../types";

import { AutoplayTimer } from "./autoplay";
import { createPlayerDOM, createHotspotElement, createAnnotationElement } from "./dom";
import type { PlayerDOM } from "./dom";
import { KeyboardHandler } from "./keyboard";
import { injectStyles, removeStyles } from "./styles";
import { tiptapToHTML, calculateTooltipPosition } from "./tooltip";

export interface RendererOptions {
  container: HTMLElement;
  config: PlayerConfig;
  analyticsUrl?: string;
}

export class DemoPlayerRenderer {
  private readonly player: DemoPlayer;
  private readonly config: PlayerConfig;
  private readonly container: HTMLElement;
  private readonly dom: PlayerDOM;
  private readonly keyboard: KeyboardHandler;
  private readonly analytics: PlayerAnalytics | null = null;
  private autoplay: AutoplayTimer | null = null;
  private naturalWidth = 0;
  private naturalHeight = 0;
  private destroyed = false;
  private readonly boundOnMouseEnter: () => void;
  private readonly boundOnMouseLeave: () => void;

  constructor(options: RendererOptions) {
    this.config = options.config;
    this.container = options.container;
    this.player = new DemoPlayer(options.config);

    injectStyles(options.config.settings.brandColor);

    this.dom = createPlayerDOM(options.config.title);

    // Apply brand color as CSS custom property
    if (options.config.settings.brandColor) {
      this.dom.root.style.setProperty(
        "--porygon-brand-color",
        options.config.settings.brandColor,
      );
    }

    // Navigation visibility
    if (options.config.settings.showNavigation === false) {
      this.dom.controls.style.display = "none";
    }

    // Progress bar visibility
    if (options.config.settings.showProgressBar === false) {
      this.dom.progressBar.style.display = "none";
    }

    // Mount DOM
    this.container.appendChild(this.dom.root);

    // Wire events
    this.dom.prevButton.addEventListener("click", this.handlePrev);
    this.dom.nextButton.addEventListener("click", this.handleNext);

    this.player.on("stepChange", this.handleStepChange);
    this.player.on("complete", this.handleComplete);

    // Keyboard
    this.keyboard = new KeyboardHandler(this.dom.root, {
      onNext: () => this.player.next(),
      onPrevious: () => this.player.previous(),
      onEscape: () => this.hideTooltip(),
    });
    this.keyboard.attach();

    // Autoplay
    if (options.config.settings.autoPlay) {
      const delay = options.config.settings.autoPlayDelay ?? 3000;
      this.autoplay = new AutoplayTimer(delay, () => this.player.next());
    }

    // Analytics
    if (options.analyticsUrl) {
      this.analytics = new PlayerAnalytics({
        apiBaseUrl: options.analyticsUrl,
        demoId: options.config.id,
        totalSteps: options.config.steps.length,
      });
      this.analytics.attach(this.player);
      this.analytics.start();
    }

    // Hover pause/resume autoplay
    this.boundOnMouseEnter = () => this.autoplay?.pause();
    this.boundOnMouseLeave = () => this.autoplay?.resume();
    this.dom.root.addEventListener("mouseenter", this.boundOnMouseEnter);
    this.dom.root.addEventListener("mouseleave", this.boundOnMouseLeave);

    // Load initial step
    this.loadScreenshot(this.player.getCurrentStep());
    this.updateControls();
  }

  getPlayer(): DemoPlayer {
    return this.player;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.analytics?.destroy();
    this.keyboard.detach();
    this.autoplay?.destroy();

    this.dom.prevButton.removeEventListener("click", this.handlePrev);
    this.dom.nextButton.removeEventListener("click", this.handleNext);
    this.dom.root.removeEventListener("mouseenter", this.boundOnMouseEnter);
    this.dom.root.removeEventListener("mouseleave", this.boundOnMouseLeave);

    this.player.off("stepChange", this.handleStepChange);
    this.player.off("complete", this.handleComplete);

    this.dom.root.remove();
    removeStyles();
  }

  private handlePrev = (): void => {
    this.player.previous();
  };

  private handleNext = (): void => {
    this.player.next();
  };

  private handleStepChange = (payload: {
    fromIndex: number;
    toIndex: number;
    step: PlayerStep;
  }): void => {
    this.hideTooltip();
    this.loadScreenshot(payload.step);
    this.updateControls();
  };

  private handleComplete = (): void => {
    this.dom.nextButton.disabled = true;
    this.autoplay?.stop();
  };

  private loadScreenshot(step: PlayerStep): void {
    const img = this.dom.screenshot;
    img.src = step.screenshotUrl;

    const onLoad = (): void => {
      img.removeEventListener("load", onLoad);
      this.naturalWidth = img.naturalWidth;
      this.naturalHeight = img.naturalHeight;
      this.renderOverlays(step);

      // Start autoplay after first image loads
      if (this.autoplay && !this.autoplay.isRunning()) {
        this.autoplay.start();
      }
    };

    img.addEventListener("load", onLoad);
  }

  private renderOverlays(step: PlayerStep): void {
    // Clear previous overlays
    this.dom.annotationLayer.innerHTML = "";
    this.dom.hotspotLayer.innerHTML = "";

    // Find crop annotation for this step
    const crop = step.annotations.find((a) => a.type === "crop");

    // Render annotations (skip crop — it's structural, not visual)
    for (const annotation of step.annotations) {
      const el = createAnnotationElement(
        annotation,
        this.naturalWidth,
        this.naturalHeight,
      );
      if (el) {
        this.dom.annotationLayer.appendChild(el);
      }
    }

    // Render hotspots
    for (const hotspot of step.hotspots) {
      const el = createHotspotElement(
        hotspot,
        this.naturalWidth,
        this.naturalHeight,
      );
      el.addEventListener("click", () => this.handleHotspotClick(hotspot));
      this.dom.hotspotLayer.appendChild(el);
    }

    // Apply crop transform
    this.applyCropTransform(crop);
  }

  private applyCropTransform(crop: PlayerStep["annotations"][number] | undefined): void {
    if (crop && this.naturalWidth > 0 && this.naturalHeight > 0) {
      const scale = this.naturalWidth / crop.width;
      const translateX = -(crop.x / this.naturalWidth) * 100;
      const translateY = -(crop.y / this.naturalHeight) * 100;
      this.dom.cropContainer.style.transform = `scale(${scale}) translate(${translateX}%, ${translateY}%)`;
      this.dom.cropContainer.style.transformOrigin = "0 0";
      this.dom.viewport.style.aspectRatio = `${crop.width} / ${crop.height}`;
    } else {
      this.dom.cropContainer.style.transform = "none";
      this.dom.cropContainer.style.transformOrigin = "";
      this.dom.viewport.style.aspectRatio = "";
    }
  }

  private handleHotspotClick(hotspot: {
    id: string;
    targetStepId: string | null;
    tooltipContent: Record<string, unknown> | null;
    tooltipPosition: "top" | "bottom" | "left" | "right";
  }): void {
    if (hotspot.targetStepId) {
      this.player.navigateBranch(hotspot.id);
    } else if (this.hasTooltipContent(hotspot.tooltipContent)) {
      this.showTooltip(hotspot);
    }
  }

  /** Check if TipTap JSON has meaningful text (not just empty paragraphs) */
  private hasTooltipContent(content: Record<string, unknown> | null): boolean {
    if (!content) return false;
    const docContent = content.content as Array<Record<string, unknown>> | undefined;
    if (!docContent || docContent.length === 0) return false;
    return docContent.some((node) => {
      const nodeContent = node.content as Array<Record<string, unknown>> | undefined;
      return nodeContent && nodeContent.length > 0;
    });
  }

  private showTooltip(hotspot: {
    id: string;
    tooltipContent: Record<string, unknown> | null;
    tooltipPosition: "top" | "bottom" | "left" | "right";
  }): void {
    if (!hotspot.tooltipContent) return;

    const html = tiptapToHTML(
      hotspot.tooltipContent as unknown as Parameters<typeof tiptapToHTML>[0],
    );
    this.dom.tooltip.innerHTML = html;
    this.dom.tooltip.classList.remove("porygon-player-tooltip--hidden");

    // Position tooltip relative to hotspot
    const hotspotEl = this.dom.hotspotLayer.querySelector(
      `[data-hotspot-id="${hotspot.id}"]`,
    );
    if (hotspotEl) {
      const hotspotRect = hotspotEl.getBoundingClientRect();
      const containerRect = this.dom.root.getBoundingClientRect();
      const pos = calculateTooltipPosition(
        hotspotRect,
        this.dom.tooltip,
        containerRect,
        hotspot.tooltipPosition,
      );
      this.dom.tooltip.style.left = pos.left;
      this.dom.tooltip.style.top = pos.top;
    }
  }

  private hideTooltip(): void {
    this.dom.tooltip.classList.add("porygon-player-tooltip--hidden");
    this.dom.tooltip.innerHTML = "";
  }

  private updateControls(): void {
    const state = this.player.getState();

    this.dom.prevButton.disabled = !state.canGoPrevious;
    this.dom.nextButton.disabled = !state.canGoNext;

    this.dom.progressText.textContent = `${state.currentStepIndex + 1} / ${state.totalSteps}`;

    const percent =
      state.totalSteps > 1
        ? ((state.currentStepIndex + 1) / state.totalSteps) * 100
        : 100;
    this.dom.progressFill.style.width = `${percent}%`;
  }
}
