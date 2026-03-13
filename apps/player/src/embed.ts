import { DemoPlayerRenderer } from "./renderer";

import type { PlayerConfig } from "./index";

export { DemoPlayer } from "./player";
export { DemoPlayerRenderer } from "./renderer";
export { PlayerAnalytics } from "./analytics";
export { generateCSS } from "./renderer";
export type {
  PlayerConfig,
  PlayerState,
  PlayerStep,
  PlayerHotspot,
  PlayerAnnotation,
  PlayerEventType,
  PlayerEventHandler,
  PlayerEventMap,
} from "./types";
export type { RendererOptions } from "./renderer";
export type { PlayerAnalyticsOptions } from "./analytics";

const instances = new Map<HTMLElement, DemoPlayerRenderer>();

function getScriptTag(): HTMLScriptElement | null {
  const scripts = document.querySelectorAll("script[src]");
  for (let i = scripts.length - 1; i >= 0; i--) {
    const script = scripts[i] as HTMLScriptElement;
    if (script.src.includes("player")) {
      return script;
    }
  }
  return null;
}

function resolveApiUrl(element: HTMLElement): string {
  // 1. data-api-url on the element
  const elementUrl = element.getAttribute("data-api-url");
  if (elementUrl) return elementUrl;

  // 2. data-api-url on the script tag
  const script = getScriptTag();
  if (script) {
    const scriptUrl = script.getAttribute("data-api-url");
    if (scriptUrl) return scriptUrl;

    // 3. Script src origin
    try {
      const url = new URL(script.src);
      return url.origin;
    } catch {
      // invalid URL, fall through
    }
  }

  // 4. window.location.origin fallback
  return window.location.origin;
}

async function initElement(element: HTMLElement): Promise<void> {
  if (element.hasAttribute("data-porygon-initialized")) return;
  if (instances.has(element)) return;

  const slug = element.getAttribute("data-demo-id");
  if (!slug) return;

  element.setAttribute("data-porygon-initialized", "");

  const apiUrl = resolveApiUrl(element);

  try {
    const response = await fetch(`${apiUrl}/api/public/demos/${slug}`);
    if (!response.ok) {
      console.warn(`[Porygon] Failed to fetch demo "${slug}": ${response.status}`);
      return;
    }

    const config: PlayerConfig = await response.json();

    const renderer = new DemoPlayerRenderer({
      container: element,
      config,
      analyticsUrl: apiUrl,
    });

    instances.set(element, renderer);
  } catch (error) {
    console.warn(`[Porygon] Error initializing demo "${slug}":`, error);
  }
}

export async function init(): Promise<void> {
  const elements = document.querySelectorAll<HTMLElement>("[data-demo-id]");
  const promises: Promise<void>[] = [];
  for (const element of elements) {
    promises.push(initElement(element));
  }
  await Promise.all(promises);
}

export function destroy(element?: HTMLElement): void {
  if (element) {
    const renderer = instances.get(element);
    if (renderer) {
      renderer.destroy();
      instances.delete(element);
      element.removeAttribute("data-porygon-initialized");
    }
    return;
  }

  // Destroy all instances
  for (const [el, renderer] of instances) {
    renderer.destroy();
    el.removeAttribute("data-porygon-initialized");
  }
  instances.clear();
}

// Auto-init on DOMContentLoaded
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      init().catch((error) => {
        console.warn("[Porygon] Auto-init error:", error);
      });
    });
  } else {
    init().catch((error) => {
      console.warn("[Porygon] Auto-init error:", error);
    });
  }
}
