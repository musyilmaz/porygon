import type { PlayerAnnotation, PlayerHotspot } from "../types";

import { hotspotToPercentStyles } from "./scaling";

const CHEVRON_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;

const CHEVRON_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

export interface PlayerDOM {
  root: HTMLDivElement;
  viewport: HTMLDivElement;
  screenshot: HTMLImageElement;
  annotationLayer: HTMLDivElement;
  hotspotLayer: HTMLDivElement;
  tooltip: HTMLDivElement;
  controls: HTMLDivElement;
  prevButton: HTMLButtonElement;
  nextButton: HTMLButtonElement;
  progressText: HTMLSpanElement;
  progressBar: HTMLDivElement;
  progressFill: HTMLDivElement;
}

export function createPlayerDOM(title: string): PlayerDOM {
  const root = document.createElement("div");
  root.className = "porygon-player";
  root.tabIndex = 0;
  root.setAttribute("role", "application");
  root.setAttribute("aria-label", `Interactive demo: ${title}`);

  // Viewport
  const viewport = document.createElement("div");
  viewport.className = "porygon-player-viewport";

  const screenshot = document.createElement("img");
  screenshot.className = "porygon-player-screenshot";
  screenshot.alt = "";
  screenshot.draggable = false;

  const annotationLayer = document.createElement("div");
  annotationLayer.className = "porygon-player-annotation-layer";

  const hotspotLayer = document.createElement("div");
  hotspotLayer.className = "porygon-player-hotspot-layer";

  viewport.appendChild(screenshot);
  viewport.appendChild(annotationLayer);
  viewport.appendChild(hotspotLayer);

  // Tooltip
  const tooltip = document.createElement("div");
  tooltip.className = "porygon-player-tooltip porygon-player-tooltip--hidden";
  tooltip.setAttribute("role", "tooltip");

  // Controls
  const controls = document.createElement("div");
  controls.className = "porygon-player-controls";

  const prevButton = document.createElement("button");
  prevButton.className = "porygon-player-prev";
  prevButton.type = "button";
  prevButton.setAttribute("aria-label", "Previous step");
  prevButton.innerHTML = CHEVRON_LEFT;

  const nextButton = document.createElement("button");
  nextButton.className = "porygon-player-next";
  nextButton.type = "button";
  nextButton.setAttribute("aria-label", "Next step");
  nextButton.innerHTML = CHEVRON_RIGHT;

  const progress = document.createElement("div");
  progress.className = "porygon-player-progress";

  const progressText = document.createElement("span");

  const progressBar = document.createElement("div");
  progressBar.className = "porygon-player-progress-bar";

  const progressFill = document.createElement("div");
  progressFill.className = "porygon-player-progress-fill";

  progressBar.appendChild(progressFill);
  progress.appendChild(progressText);
  progress.appendChild(progressBar);

  controls.appendChild(prevButton);
  controls.appendChild(progress);
  controls.appendChild(nextButton);

  root.appendChild(viewport);
  root.appendChild(tooltip);
  root.appendChild(controls);

  return {
    root,
    viewport,
    screenshot,
    annotationLayer,
    hotspotLayer,
    tooltip,
    controls,
    prevButton,
    nextButton,
    progressText,
    progressBar,
    progressFill,
  };
}

export function createHotspotElement(
  hotspot: PlayerHotspot,
  naturalWidth: number,
  naturalHeight: number,
): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "porygon-player-hotspot";
  el.dataset.hotspotId = hotspot.id;
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", "Hotspot");

  const pos = hotspotToPercentStyles(hotspot, naturalWidth, naturalHeight);
  el.style.left = pos.left;
  el.style.top = pos.top;
  el.style.width = pos.width;
  el.style.height = pos.height;

  if (hotspot.style.borderColor) {
    el.style.borderColor = hotspot.style.borderColor;
  }
  el.style.borderWidth = `${hotspot.style.borderWidth ?? 2}px`;
  el.style.borderStyle = "solid";

  if (hotspot.style.backgroundColor) {
    el.style.backgroundColor = hotspot.style.backgroundColor;
  }
  if (hotspot.style.opacity !== undefined) {
    el.style.opacity = String(hotspot.style.opacity);
  }
  if (hotspot.style.pulseAnimation) {
    el.classList.add("porygon-player-hotspot--pulse");
  }

  return el;
}

export function createAnnotationElement(
  annotation: PlayerAnnotation,
  naturalWidth: number,
  naturalHeight: number,
): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "porygon-player-annotation";
  el.dataset.annotationId = annotation.id;

  const pos = hotspotToPercentStyles(annotation, naturalWidth, naturalHeight);
  el.style.left = pos.left;
  el.style.top = pos.top;
  el.style.width = pos.width;
  el.style.height = pos.height;

  if (annotation.type === "blur") {
    el.classList.add("porygon-player-annotation--blur");
    const intensity = annotation.settings.blurIntensity ?? 8;
    el.style.backdropFilter = `blur(${intensity}px)`;
    el.style.setProperty(
      "-webkit-backdrop-filter",
      `blur(${intensity}px)`,
    );
  } else if (annotation.type === "highlight") {
    el.classList.add("porygon-player-annotation--highlight");
    el.style.backgroundColor =
      annotation.settings.highlightColor ?? "rgba(255, 255, 0, 0.3)";
    if (annotation.settings.highlightOpacity !== undefined) {
      el.style.opacity = String(annotation.settings.highlightOpacity);
    }
  }

  return el;
}
