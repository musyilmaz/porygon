import type { ActionType } from "@repo/shared/types";

import type { ActionCapturedMessage } from "@/types/messages";
import { debounce } from "@/utils/debounce";

const SCROLL_DEBOUNCE_MS = 300;
const KEYDOWN_DEBOUNCE_MS = 500;

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

function handleClick(event: MouseEvent): void {
  sendAction("click", event.clientX, event.clientY);
}

const handleScroll = debounce(() => {
  sendAction("scroll", 0, 0);
}, SCROLL_DEBOUNCE_MS);

const handleKeydown = debounce(() => {
  sendAction("type", 0, 0);
}, KEYDOWN_DEBOUNCE_MS);

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
