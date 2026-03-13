// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { PlayerConfig } from "./types";

function makeConfig(slug = "test-demo"): PlayerConfig {
  return {
    id: "demo-1",
    title: "Test Demo",
    description: null,
    slug,
    settings: {
      showNavigation: true,
      showProgressBar: true,
      autoPlay: false,
    },
    steps: [
      {
        id: "step-0",
        orderIndex: 0,
        screenshotUrl: "https://example.com/step0.png",
        actionType: "click" as const,
        actionCoordinates: null,
        hotspots: [],
        annotations: [],
      },
      {
        id: "step-1",
        orderIndex: 1,
        screenshotUrl: "https://example.com/step1.png",
        actionType: "click" as const,
        actionCoordinates: null,
        hotspots: [],
        annotations: [],
      },
    ],
  };
}

function createDemoElement(slug: string, attrs?: Record<string, string>): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-demo-id", slug);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  document.body.appendChild(el);
  return el;
}

/** Filter fetch calls to only the demo config fetches (not analytics) */
function demoFetchCalls(mock: ReturnType<typeof vi.fn>) {
  return mock.mock.calls.filter(
    (c: unknown[]) => (c[0] as string).includes("/api/public/demos/"),
  );
}

describe("embed", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let embed: typeof import("./embed");

  beforeEach(async () => {
    vi.resetModules();
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(makeConfig()),
    });
    vi.stubGlobal("fetch", fetchMock);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Import fresh module. Auto-init fires but DOM is empty so it's a no-op.
    embed = await import("./embed");
    await new Promise((r) => setTimeout(r, 0));
    fetchMock.mockClear();
  });

  afterEach(() => {
    embed.destroy();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  describe("init()", () => {
    it("finds and initializes [data-demo-id] elements", async () => {
      const el = createDemoElement("my-demo");

      await embed.init();

      const demoCalls = demoFetchCalls(fetchMock);
      expect(demoCalls).toHaveLength(1);
      expect(demoCalls[0]![0]).toContain("/api/public/demos/my-demo");
      expect(el.hasAttribute("data-porygon-initialized")).toBe(true);
    });

    it("skips already-initialized elements", async () => {
      const el = createDemoElement("my-demo");
      el.setAttribute("data-porygon-initialized", "");

      await embed.init();

      expect(demoFetchCalls(fetchMock)).toHaveLength(0);
    });

    it("initializes multiple players independently", async () => {
      createDemoElement("demo-a");
      createDemoElement("demo-b");

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makeConfig("demo-a")),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makeConfig("demo-b")),
        });

      await embed.init();

      const demoCalls = demoFetchCalls(fetchMock);
      expect(demoCalls).toHaveLength(2);

      const urls = demoCalls.map((c) => c[0] as string);
      expect(urls.some((u) => u.includes("demo-a"))).toBe(true);
      expect(urls.some((u) => u.includes("demo-b"))).toBe(true);
    });

    it("handles fetch error gracefully", async () => {
      createDemoElement("bad-demo");
      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      await embed.init();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Porygon]"),
        expect.anything(),
      );
    });

    it("handles non-ok response gracefully", async () => {
      createDemoElement("missing-demo");
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await embed.init();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("404"),
      );
    });
  });

  describe("API URL resolution", () => {
    it("uses data-api-url from element", async () => {
      createDemoElement("my-demo", { "data-api-url": "https://custom.example.com" });

      await embed.init();

      const demoCalls = demoFetchCalls(fetchMock);
      expect(demoCalls[0]![0]).toBe("https://custom.example.com/api/public/demos/my-demo");
    });

    it("uses data-api-url from script tag", async () => {
      const script = document.createElement("script");
      script.src = "https://cdn.example.com/player.js";
      script.setAttribute("data-api-url", "https://app.example.com");
      document.body.appendChild(script);

      createDemoElement("my-demo");

      await embed.init();

      const demoCalls = demoFetchCalls(fetchMock);
      expect(demoCalls[0]![0]).toBe("https://app.example.com/api/public/demos/my-demo");

      script.remove();
    });

    it("uses script src origin as fallback", async () => {
      const script = document.createElement("script");
      script.src = "https://cdn.example.com/assets/player.js";
      document.body.appendChild(script);

      createDemoElement("my-demo");

      await embed.init();

      const demoCalls = demoFetchCalls(fetchMock);
      expect(demoCalls[0]![0]).toBe("https://cdn.example.com/api/public/demos/my-demo");

      script.remove();
    });

    it("falls back to window.location.origin", async () => {
      createDemoElement("my-demo");

      await embed.init();

      const demoCalls = demoFetchCalls(fetchMock);
      expect(demoCalls[0]![0]).toContain("/api/public/demos/my-demo");
    });
  });

  describe("re-scan via init()", () => {
    it("picks up dynamically added elements", async () => {
      await embed.init();
      expect(demoFetchCalls(fetchMock)).toHaveLength(0);

      createDemoElement("dynamic-demo");

      await embed.init();
      expect(demoFetchCalls(fetchMock)).toHaveLength(1);
    });
  });

  describe("destroy()", () => {
    it("destroys a specific element", async () => {
      const el = createDemoElement("my-demo");

      await embed.init();
      expect(el.hasAttribute("data-porygon-initialized")).toBe(true);

      embed.destroy(el);
      expect(el.hasAttribute("data-porygon-initialized")).toBe(false);
    });

    it("destroys all instances when called without args", async () => {
      const el1 = createDemoElement("demo-a");
      const el2 = createDemoElement("demo-b");

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makeConfig("demo-a")),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makeConfig("demo-b")),
        });

      await embed.init();

      embed.destroy();

      expect(el1.hasAttribute("data-porygon-initialized")).toBe(false);
      expect(el2.hasAttribute("data-porygon-initialized")).toBe(false);
    });

    it("is safe to call on non-initialized element", async () => {
      const el = document.createElement("div");
      document.body.appendChild(el);

      embed.destroy(el);
    });
  });

  describe("auto-init", () => {
    it("initializes elements present at load time", async () => {
      vi.resetModules();
      const freshFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeConfig("auto-demo")),
      });
      vi.stubGlobal("fetch", freshFetch);

      createDemoElement("auto-demo");

      const freshEmbed = await import("./embed");
      await new Promise((r) => setTimeout(r, 10));

      const demoCalls = freshFetch.mock.calls.filter(
        (c: unknown[]) => (c[0] as string).includes("/api/public/demos/"),
      );
      expect(demoCalls).toHaveLength(1);
      expect(demoCalls[0]![0]).toContain("/api/public/demos/auto-demo");

      freshEmbed.destroy();
    });
  });
});
