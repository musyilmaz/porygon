// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { PlayerAnalytics } from "./analytics";
import { DemoPlayer } from "./player";
import type { PlayerConfig } from "./types";

function makeConfig(stepCount = 5): PlayerConfig {
  return {
    id: "demo-1",
    title: "Test Demo",
    description: null,
    slug: "test-demo",
    settings: {
      showNavigation: true,
      showProgressBar: true,
      autoPlay: false,
    },
    steps: Array.from({ length: stepCount }, (_, i) => ({
      id: `step-${i}`,
      orderIndex: i,
      screenshotUrl: `https://example.com/step${i}.png`,
      actionType: "click" as const,
      actionCoordinates: null,
      hotspots: [],
      annotations: [],
    })),
  };
}

function createAnalytics(
  overrides: Partial<{ apiBaseUrl: string; demoId: string; totalSteps: number }> = {},
) {
  return new PlayerAnalytics({
    apiBaseUrl: "https://app.example.com",
    demoId: "demo-1",
    totalSteps: 5,
    ...overrides,
  });
}

describe("PlayerAnalytics", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "view-123" }),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("start()", () => {
    it("POSTs correct URL and body", async () => {
      const analytics = createAnalytics();
      const player = new DemoPlayer(makeConfig());
      analytics.attach(player);
      analytics.start();

      await vi.advanceTimersByTimeAsync(0);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://app.example.com/api/analytics/views");
      expect(opts.method).toBe("POST");

      const body = JSON.parse(opts.body as string);
      expect(body.demoId).toBe("demo-1");
      expect(body.totalSteps).toBe(5);
      expect(body.viewerHash).toEqual(expect.any(String));
      expect(body).toHaveProperty("referrer");
      expect(body).toHaveProperty("userAgent");

      analytics.destroy();
    });
  });

  describe("stepChange", () => {
    it("updates maxStepReached", async () => {
      const analytics = createAnalytics();
      const player = new DemoPlayer(makeConfig());
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      player.next(); // step 0 -> 1
      player.next(); // step 1 -> 2

      // Flush via timer to observe the PATCH
      vi.advanceTimersByTime(30_000);
      await vi.advanceTimersByTimeAsync(0);

      const patchCall = fetchMock.mock.calls.find(
        (c: unknown[]) => (c[1] as RequestInit).method === "PATCH",
      );
      expect(patchCall).toBeDefined();
      const body = JSON.parse((patchCall![1] as RequestInit).body as string);
      expect(body.stepsViewed).toBe(3); // maxStepReached(2) + 1
      analytics.destroy();
    });

    it("flushes after 5 step changes", async () => {
      const analytics = createAnalytics({ totalSteps: 10 });
      const player = new DemoPlayer(makeConfig(10));
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      for (let i = 0; i < 5; i++) {
        player.next();
      }

      await vi.advanceTimersByTimeAsync(0);

      const patchCalls = fetchMock.mock.calls.filter(
        (c: unknown[]) => (c[1] as RequestInit).method === "PATCH",
      );
      expect(patchCalls.length).toBe(1);
      const body = JSON.parse((patchCalls[0]![1] as RequestInit).body as string);
      expect(body.stepsViewed).toBe(6); // maxStepReached(5) + 1

      analytics.destroy();
    });
  });

  describe("flush timer", () => {
    it("flushes after 30s when dirty", async () => {
      const analytics = createAnalytics();
      const player = new DemoPlayer(makeConfig());
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      player.next(); // dirty

      vi.advanceTimersByTime(30_000);
      await vi.advanceTimersByTimeAsync(0);

      const patchCalls = fetchMock.mock.calls.filter(
        (c: unknown[]) => (c[1] as RequestInit).method === "PATCH",
      );
      expect(patchCalls.length).toBe(1);

      analytics.destroy();
    });

    it("does not flush when not dirty", async () => {
      const analytics = createAnalytics();
      const player = new DemoPlayer(makeConfig());
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      vi.advanceTimersByTime(30_000);
      await vi.advanceTimersByTimeAsync(0);

      const patchCalls = fetchMock.mock.calls.filter(
        (c: unknown[]) => (c[1] as RequestInit).method === "PATCH",
      );
      expect(patchCalls.length).toBe(0);

      analytics.destroy();
    });
  });

  describe("complete", () => {
    it("sends PATCH with completed: true", async () => {
      const analytics = createAnalytics({ totalSteps: 3 });
      const player = new DemoPlayer(makeConfig(3));
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      player.next(); // step 1
      player.next(); // step 2 (last)
      player.next(); // complete

      await vi.advanceTimersByTimeAsync(0);

      const patchCalls = fetchMock.mock.calls.filter(
        (c: unknown[]) => (c[1] as RequestInit).method === "PATCH",
      );
      // May have a step-count flush + complete flush, find the complete one
      const completeCall = patchCalls.find((c: unknown[]) => {
        const body = JSON.parse((c[1] as RequestInit).body as string);
        return body.completed === true;
      });
      expect(completeCall).toBeDefined();
      const body = JSON.parse((completeCall![1] as RequestInit).body as string);
      expect(body.completed).toBe(true);
      expect(body.completedAt).toEqual(expect.any(String));
      expect(body.stepsViewed).toBe(3);

      analytics.destroy();
    });

    it("is idempotent", async () => {
      const analytics = createAnalytics({ totalSteps: 2 });
      const player = new DemoPlayer(makeConfig(2));
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      player.next(); // step 1 (last)
      player.next(); // complete

      await vi.advanceTimersByTimeAsync(0);

      const countBefore = fetchMock.mock.calls.filter(
        (c: unknown[]) => {
          const body = JSON.parse((c[1] as RequestInit).body as string);
          return body.completed === true;
        },
      ).length;

      // Reset player and trigger complete again manually — but the analytics
      // should have already marked completed = true, so a second complete
      // event won't fire another PATCH.
      // We simulate by calling player.reset() then completing again.
      player.reset();
      player.next(); // last step
      player.next(); // complete again

      await vi.advanceTimersByTimeAsync(0);

      const countAfter = fetchMock.mock.calls.filter(
        (c: unknown[]) => {
          const body = JSON.parse((c[1] as RequestInit).body as string);
          return body.completed === true;
        },
      ).length;

      expect(countAfter).toBe(countBefore);

      analytics.destroy();
    });
  });

  describe("visibility change", () => {
    it("triggers keepalive fetch when hidden", async () => {
      const analytics = createAnalytics();
      const player = new DemoPlayer(makeConfig());
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      player.next(); // dirty

      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));

      await vi.advanceTimersByTimeAsync(0);

      const patchCall = fetchMock.mock.calls.find(
        (c: unknown[]) => (c[1] as RequestInit).method === "PATCH",
      );
      expect(patchCall).toBeDefined();
      expect((patchCall![1] as RequestInit).keepalive).toBe(true);

      // Restore
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        configurable: true,
      });

      analytics.destroy();
    });
  });

  describe("failed init", () => {
    it("makes all ops no-ops when POST fails", async () => {
      fetchMock.mockResolvedValueOnce({ ok: false });

      const analytics = createAnalytics();
      const player = new DemoPlayer(makeConfig());
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      player.next();
      player.next();
      player.next();

      vi.advanceTimersByTime(30_000);
      await vi.advanceTimersByTimeAsync(0);

      // Only the initial POST, no PATCHes
      const patchCalls = fetchMock.mock.calls.filter(
        (c: unknown[]) => (c[1] as RequestInit).method === "PATCH",
      );
      expect(patchCalls.length).toBe(0);

      analytics.destroy();
    });

    it("makes all ops no-ops when POST throws", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      const analytics = createAnalytics();
      const player = new DemoPlayer(makeConfig());
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      player.next();
      vi.advanceTimersByTime(30_000);
      await vi.advanceTimersByTimeAsync(0);

      const patchCalls = fetchMock.mock.calls.filter(
        (c: unknown[]) => (c[1] as RequestInit).method === "PATCH",
      );
      expect(patchCalls.length).toBe(0);

      analytics.destroy();
    });
  });

  describe("failed PATCH", () => {
    it("does not throw", async () => {
      const analytics = createAnalytics();
      const player = new DemoPlayer(makeConfig());
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      // Make PATCH calls reject
      fetchMock.mockRejectedValue(new Error("Network error"));

      player.next();
      vi.advanceTimersByTime(30_000);
      await vi.advanceTimersByTimeAsync(0);

      // Should not throw — test passes if we get here
      analytics.destroy();
    });
  });

  describe("destroy()", () => {
    it("clears timer, flushes, and removes listeners", async () => {
      const analytics = createAnalytics();
      const player = new DemoPlayer(makeConfig());
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      player.next(); // dirty

      const removeListenerSpy = vi.spyOn(document, "removeEventListener");
      analytics.destroy();

      await vi.advanceTimersByTimeAsync(0);

      // Should have flushed with keepalive
      const patchCall = fetchMock.mock.calls.find(
        (c: unknown[]) =>
          (c[1] as RequestInit).method === "PATCH" &&
          (c[1] as RequestInit).keepalive === true,
      );
      expect(patchCall).toBeDefined();

      // Should have removed visibilitychange listener
      expect(removeListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );

      // Timer should be cleared — advancing time should not cause more flushes
      const callCountAfterDestroy = fetchMock.mock.calls.length;
      vi.advanceTimersByTime(60_000);
      await vi.advanceTimersByTimeAsync(0);
      expect(fetchMock.mock.calls.length).toBe(callCountAfterDestroy);

      removeListenerSpy.mockRestore();
    });

    it("is idempotent", async () => {
      const analytics = createAnalytics();
      const player = new DemoPlayer(makeConfig());
      analytics.attach(player);
      analytics.start();
      await vi.advanceTimersByTimeAsync(0);

      analytics.destroy();
      analytics.destroy(); // should not throw

      await vi.advanceTimersByTimeAsync(0);
    });
  });
});
