import type { ActionType } from "@porygon/shared/types";

import type {
  ActionCapturedMessage,
  ContinuousActionEndMessage,
  ContinuousActionStartMessage,
  NavigationDetectedMessage,
} from "@/types/messages";
import { leadingTrailingDebounce } from "@/utils/debounce";

const CONTINUOUS_IDLE_MS = 500;

// SPA navigation detection state
let currentUrl = "";
let originalPushState: typeof history.pushState | null = null;
let originalReplaceState: typeof history.replaceState | null = null;

function sendAction(actionType: ActionType, x: number, y: number): void {
  const message: ActionCapturedMessage = {
    type: "ACTION_CAPTURED",
    payload: {
      actionType,
      coordinates: { x, y },
      timestamp: Date.now(),
      scrollY: window.scrollY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    },
  };

  browser.runtime.sendMessage(message);
}

function sendContinuousStart(actionType: ActionType): void {
  const message: ContinuousActionStartMessage = {
    type: "CONTINUOUS_ACTION_START",
    payload: {
      actionType,
      timestamp: Date.now(),
    },
  };

  browser.runtime.sendMessage(message);
}

function sendContinuousEnd(actionType: ActionType): void {
  const message: ContinuousActionEndMessage = {
    type: "CONTINUOUS_ACTION_END",
    payload: {
      actionType,
      timestamp: Date.now(),
      scrollY: window.scrollY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    },
  };

  browser.runtime.sendMessage(message);
}

function isHashOnlyChange(oldUrl: string, newUrl: string): boolean {
  const a = new URL(oldUrl);
  const b = new URL(newUrl);
  a.hash = "";
  b.hash = "";
  return a.href === b.href;
}

function checkUrlChanged(): void {
  const newUrl = location.href;

  if (newUrl === currentUrl) return;
  if (isHashOnlyChange(currentUrl, newUrl)) return;

  currentUrl = newUrl;

  const message: NavigationDetectedMessage = {
    type: "NAVIGATION_DETECTED",
    payload: {
      url: newUrl,
      timestamp: Date.now(),
      scrollY: window.scrollY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    },
  };

  browser.runtime.sendMessage(message);
}

function handleClick(event: MouseEvent): void {
  sendAction("click", event.clientX, event.clientY);
}

const handleScroll = leadingTrailingDebounce(
  () => sendContinuousStart("scroll"),
  () => sendContinuousEnd("scroll"),
  CONTINUOUS_IDLE_MS,
);

const handleKeydown = leadingTrailingDebounce(
  () => sendContinuousStart("type"),
  () => sendContinuousEnd("type"),
  CONTINUOUS_IDLE_MS,
);

let abortController: AbortController | null = null;

export function attachListeners(): void {
  if (abortController) {
    return;
  }

  abortController = new AbortController();
  const { signal } = abortController;

  document.addEventListener("click", handleClick, { capture: true, signal });
  document.addEventListener("scroll", handleScroll, { capture: true, signal });
  document.addEventListener("keydown", handleKeydown, {
    capture: true,
    signal,
  });

  // SPA navigation detection
  currentUrl = location.href;

  originalPushState = history.pushState.bind(history);
  originalReplaceState = history.replaceState.bind(history);

  const boundOriginalPushState = originalPushState;
  const boundOriginalReplaceState = originalReplaceState;

  history.pushState = function (...args: Parameters<typeof history.pushState>) {
    boundOriginalPushState(...args);
    checkUrlChanged();
  };

  history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
    boundOriginalReplaceState(...args);
    checkUrlChanged();
  };

  window.addEventListener("popstate", () => checkUrlChanged(), { signal });

  console.log("[Porygon] Event listeners attached");
}

export function detachListeners(): void {
  if (!abortController) {
    return;
  }

  abortController.abort();
  abortController = null;

  // Restore original history methods
  if (originalPushState) {
    history.pushState = originalPushState;
    originalPushState = null;
  }
  if (originalReplaceState) {
    history.replaceState = originalReplaceState;
    originalReplaceState = null;
  }

  console.log("[Porygon] Event listeners detached");
}
