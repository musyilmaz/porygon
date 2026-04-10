/**
 * Type declarations for Chrome extension APIs not covered by @wxt-dev/browser.
 * These APIs are available at runtime via the `chrome` global.
 */

declare namespace chrome {
  namespace tabCapture {
    interface GetMediaStreamOptions {
      targetTabId?: number;
    }
    function getMediaStreamId(
      options: GetMediaStreamOptions,
    ): Promise<string>;
  }

  namespace offscreen {
    type Reason =
      | "TESTING"
      | "AUDIO_PLAYBACK"
      | "IFRAME_SCRIPTING"
      | "DOM_SCRAPING"
      | "BLOBS"
      | "DOM_PARSER"
      | "MEDIA_STREAM"
      | "DISPLAY_MEDIA"
      | "WEB_RTC"
      | "CLIPBOARD"
      | "LOCAL_STORAGE"
      | "WORKERS"
      | "BATTERY_STATUS"
      | "MATCH_MEDIA"
      | "GEOLOCATION"
      | "USER_MEDIA";

    interface CreateParameters {
      url: string;
      reasons: Reason[];
      justification: string;
    }

    function createDocument(parameters: CreateParameters): Promise<void>;
    function closeDocument(): Promise<void>;
    function hasDocument(): Promise<boolean>;
  }
}
