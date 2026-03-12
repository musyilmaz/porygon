import { attachListeners, detachListeners } from "@/lib/event-listeners";
import type { ExtensionMessage } from "@/types/messages";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("[Porygon] Content script injected");

    browser.runtime.onMessage.addListener(
      (message: ExtensionMessage, _sender, sendResponse) => {
        if (message.type === "PING") {
          sendResponse({ pong: true });
        } else if (message.type === "RECORDING_STARTED") {
          attachListeners();
          sendResponse({ success: true });
        } else if (message.type === "RECORDING_STOPPED") {
          detachListeners();
          sendResponse({ success: true });
        } else if (message.type === "RECORDING_PAUSED") {
          detachListeners();
          sendResponse({ success: true });
        } else if (message.type === "RECORDING_RESUMED") {
          attachListeners();
          sendResponse({ success: true });
        }
      },
    );
  },
});
