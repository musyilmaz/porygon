import type { ActionType } from "@porygon/shared/types";

import type {
  ActionCapturedMessage,
  ContinuousActionEndMessage,
  ContinuousActionStartMessage,
} from "@/types/messages";
import { leadingTrailingDebounce } from "@/utils/debounce";

const CONTINUOUS_IDLE_MS = 500;

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

  console.log("[Porygon] Event listeners attached");
}

export function detachListeners(): void {
  if (!abortController) {
    return;
  }

  abortController.abort();
  abortController = null;

  console.log("[Porygon] Event listeners detached");
}
