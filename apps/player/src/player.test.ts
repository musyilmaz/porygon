import { describe, it, expect, vi } from "vitest";

import { DemoPlayer } from "./player";
import type { PlayerConfig, PlayerStep } from "./types";

function makeStep(overrides: Partial<PlayerStep> = {}): PlayerStep {
  return {
    id: "step-1",
    orderIndex: 0,
    screenshotUrl: "https://example.com/screenshot.png",
    actionType: "click",
    actionCoordinates: null,
    hotspots: [],
    annotations: [],
    ...overrides,
  };
}

function makeConfig(overrides: Partial<PlayerConfig> = {}): PlayerConfig {
  return {
    id: "demo-1",
    title: "Test Demo",
    description: null,
    slug: "test-demo",
    settings: {},
    steps: [
      makeStep({ id: "step-1", orderIndex: 0 }),
      makeStep({ id: "step-2", orderIndex: 1 }),
      makeStep({ id: "step-3", orderIndex: 2 }),
    ],
    ...overrides,
  };
}

describe("DemoPlayer", () => {
  describe("constructor", () => {
    it("initializes with correct default state", () => {
      const player = new DemoPlayer(makeConfig());
      const state = player.getState();

      expect(state.currentStepIndex).toBe(0);
      expect(state.totalSteps).toBe(3);
      expect(state.isFirst).toBe(true);
      expect(state.isLast).toBe(false);
      expect(state.isComplete).toBe(false);
      expect(state.canGoNext).toBe(true);
      expect(state.canGoPrevious).toBe(false);
    });

    it("throws on empty steps", () => {
      expect(() => new DemoPlayer(makeConfig({ steps: [] }))).toThrow(
        "DemoPlayer requires at least one step",
      );
    });

    it("sorts steps by orderIndex", () => {
      const player = new DemoPlayer(
        makeConfig({
          steps: [
            makeStep({ id: "c", orderIndex: 2 }),
            makeStep({ id: "a", orderIndex: 0 }),
            makeStep({ id: "b", orderIndex: 1 }),
          ],
        }),
      );

      expect(player.getCurrentStep().id).toBe("a");
      player.next();
      expect(player.getCurrentStep().id).toBe("b");
      player.next();
      expect(player.getCurrentStep().id).toBe("c");
    });
  });

  describe("next()", () => {
    it("advances to the next step", () => {
      const player = new DemoPlayer(makeConfig());
      player.next();

      expect(player.getState().currentStepIndex).toBe(1);
    });

    it("emits stepChange event", () => {
      const player = new DemoPlayer(makeConfig());
      const handler = vi.fn();
      player.on("stepChange", handler);

      player.next();

      expect(handler).toHaveBeenCalledWith({
        fromIndex: 0,
        toIndex: 1,
        step: expect.objectContaining({ id: "step-2" }),
      });
    });

    it("marks complete on last step instead of advancing", () => {
      const player = new DemoPlayer(makeConfig());
      player.next(); // step 1
      player.next(); // step 2 (last)

      const completeHandler = vi.fn();
      player.on("complete", completeHandler);
      player.next(); // should mark complete

      expect(player.getState().isComplete).toBe(true);
      expect(completeHandler).toHaveBeenCalledWith({ totalSteps: 3 });
    });

    it("is a no-op when already complete", () => {
      const player = new DemoPlayer(makeConfig());
      player.next();
      player.next();
      player.next(); // complete

      const handler = vi.fn();
      player.on("stepChange", handler);
      player.on("complete", handler);
      player.next();

      expect(handler).not.toHaveBeenCalled();
      expect(player.getState().currentStepIndex).toBe(2);
    });
  });

  describe("previous()", () => {
    it("goes back to the previous step", () => {
      const player = new DemoPlayer(makeConfig());
      player.next();
      player.previous();

      expect(player.getState().currentStepIndex).toBe(0);
    });

    it("emits stepChange event", () => {
      const player = new DemoPlayer(makeConfig());
      player.next();

      const handler = vi.fn();
      player.on("stepChange", handler);
      player.previous();

      expect(handler).toHaveBeenCalledWith({
        fromIndex: 1,
        toIndex: 0,
        step: expect.objectContaining({ id: "step-1" }),
      });
    });

    it("is a no-op when history is empty", () => {
      const player = new DemoPlayer(makeConfig());
      const handler = vi.fn();
      player.on("stepChange", handler);

      player.previous();

      expect(handler).not.toHaveBeenCalled();
      expect(player.getState().currentStepIndex).toBe(0);
    });

    it("resets isComplete when going back from done", () => {
      const player = new DemoPlayer(makeConfig());
      player.next();
      player.next();
      player.next(); // complete

      expect(player.getState().isComplete).toBe(true);

      player.previous();

      expect(player.getState().isComplete).toBe(false);
      expect(player.getState().currentStepIndex).toBe(1);
    });
  });

  describe("goToStep()", () => {
    it("navigates to step by ID", () => {
      const player = new DemoPlayer(makeConfig());
      player.goToStep("step-3");

      expect(player.getState().currentStepIndex).toBe(2);
    });

    it("adds current step to history", () => {
      const player = new DemoPlayer(makeConfig());
      player.goToStep("step-3");
      player.previous();

      expect(player.getState().currentStepIndex).toBe(0);
    });

    it("throws on unknown step ID", () => {
      const player = new DemoPlayer(makeConfig());

      expect(() => player.goToStep("nonexistent")).toThrow(
        "Unknown step ID: nonexistent",
      );
    });

    it("is a no-op when navigating to current step", () => {
      const player = new DemoPlayer(makeConfig());
      const handler = vi.fn();
      player.on("stepChange", handler);

      player.goToStep("step-1");

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("navigateBranch()", () => {
    function makeConfigWithBranch(): PlayerConfig {
      return makeConfig({
        steps: [
          makeStep({
            id: "step-1",
            orderIndex: 0,
            hotspots: [
              {
                id: "hotspot-1",
                x: 10,
                y: 20,
                width: 100,
                height: 50,
                targetStepId: "step-3",
                tooltipContent: null,
                tooltipPosition: "top",
                style: {},
              },
              {
                id: "hotspot-null",
                x: 50,
                y: 60,
                width: 80,
                height: 40,
                targetStepId: null,
                tooltipContent: null,
                tooltipPosition: "bottom",
                style: {},
              },
            ],
          }),
          makeStep({ id: "step-2", orderIndex: 1 }),
          makeStep({ id: "step-3", orderIndex: 2 }),
        ],
      });
    }

    it("branches to the target step via hotspot", () => {
      const player = new DemoPlayer(makeConfigWithBranch());
      player.navigateBranch("hotspot-1");

      expect(player.getState().currentStepIndex).toBe(2);
    });

    it("emits branchSelect then stepChange", () => {
      const player = new DemoPlayer(makeConfigWithBranch());
      const events: string[] = [];

      player.on("branchSelect", () => events.push("branchSelect"));
      player.on("stepChange", () => events.push("stepChange"));

      player.navigateBranch("hotspot-1");

      expect(events).toEqual(["branchSelect", "stepChange"]);
    });

    it("emits branchSelect with correct payload", () => {
      const player = new DemoPlayer(makeConfigWithBranch());
      const handler = vi.fn();
      player.on("branchSelect", handler);

      player.navigateBranch("hotspot-1");

      expect(handler).toHaveBeenCalledWith({
        hotspotId: "hotspot-1",
        fromIndex: 0,
        toIndex: 2,
      });
    });

    it("is a no-op when targetStepId is null", () => {
      const player = new DemoPlayer(makeConfigWithBranch());
      const handler = vi.fn();
      player.on("stepChange", handler);
      player.on("branchSelect", handler);

      player.navigateBranch("hotspot-null");

      expect(handler).not.toHaveBeenCalled();
      expect(player.getState().currentStepIndex).toBe(0);
    });

    it("throws on unknown hotspot ID", () => {
      const player = new DemoPlayer(makeConfigWithBranch());

      expect(() => player.navigateBranch("nonexistent")).toThrow(
        "Unknown hotspot ID: nonexistent",
      );
    });
  });

  describe("history", () => {
    it("tracks correct back-navigation through branches", () => {
      const config = makeConfig({
        steps: [
          makeStep({
            id: "step-1",
            orderIndex: 0,
            hotspots: [
              {
                id: "h1",
                x: 0,
                y: 0,
                width: 10,
                height: 10,
                targetStepId: "step-3",
                tooltipContent: null,
                tooltipPosition: "top",
                style: {},
              },
            ],
          }),
          makeStep({ id: "step-2", orderIndex: 1 }),
          makeStep({
            id: "step-3",
            orderIndex: 2,
            hotspots: [
              {
                id: "h2",
                x: 0,
                y: 0,
                width: 10,
                height: 10,
                targetStepId: "step-2",
                tooltipContent: null,
                tooltipPosition: "top",
                style: {},
              },
            ],
          }),
        ],
      });

      const player = new DemoPlayer(config);

      // step-1 -> branch to step-3 -> branch to step-2
      player.navigateBranch("h1");
      expect(player.getCurrentStep().id).toBe("step-3");

      player.navigateBranch("h2");
      expect(player.getCurrentStep().id).toBe("step-2");

      // back should retrace: step-2 -> step-3 -> step-1
      player.previous();
      expect(player.getCurrentStep().id).toBe("step-3");

      player.previous();
      expect(player.getCurrentStep().id).toBe("step-1");
    });

    it("maintains history across next and goToStep", () => {
      const player = new DemoPlayer(makeConfig());

      player.next(); // 0 -> 1
      player.goToStep("step-3"); // 1 -> 2

      player.previous(); // 2 -> 1
      expect(player.getCurrentStep().id).toBe("step-2");

      player.previous(); // 1 -> 0
      expect(player.getCurrentStep().id).toBe("step-1");
    });
  });

  describe("events", () => {
    it("on/off registers and removes handlers", () => {
      const player = new DemoPlayer(makeConfig());
      const handler = vi.fn();

      player.on("stepChange", handler);
      player.next();
      expect(handler).toHaveBeenCalledTimes(1);

      player.off("stepChange", handler);
      player.next();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("supports multiple handlers for same event", () => {
      const player = new DemoPlayer(makeConfig());
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      player.on("stepChange", handler1);
      player.on("stepChange", handler2);
      player.next();

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("off only removes the specific handler", () => {
      const player = new DemoPlayer(makeConfig());
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      player.on("stepChange", handler1);
      player.on("stepChange", handler2);
      player.off("stepChange", handler1);
      player.next();

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe("reset()", () => {
    it("returns to initial state", () => {
      const player = new DemoPlayer(makeConfig());
      player.next();
      player.next();
      player.next(); // complete

      player.reset();

      const state = player.getState();
      expect(state.currentStepIndex).toBe(0);
      expect(state.isFirst).toBe(true);
      expect(state.isComplete).toBe(false);
      expect(state.canGoPrevious).toBe(false);
    });

    it("emits stepChange event", () => {
      const player = new DemoPlayer(makeConfig());
      player.next();
      player.next();

      const handler = vi.fn();
      player.on("stepChange", handler);
      player.reset();

      expect(handler).toHaveBeenCalledWith({
        fromIndex: 2,
        toIndex: 0,
        step: expect.objectContaining({ id: "step-1" }),
      });
    });
  });

  describe("getState()", () => {
    it("returns correct snapshot for first step", () => {
      const player = new DemoPlayer(makeConfig());
      const state = player.getState();

      expect(state.currentStepIndex).toBe(0);
      expect(state.currentStep.id).toBe("step-1");
      expect(state.totalSteps).toBe(3);
      expect(state.isFirst).toBe(true);
      expect(state.isLast).toBe(false);
      expect(state.canGoNext).toBe(true);
      expect(state.canGoPrevious).toBe(false);
    });

    it("returns correct snapshot for last step", () => {
      const player = new DemoPlayer(makeConfig());
      player.next();
      player.next();

      const state = player.getState();
      expect(state.isFirst).toBe(false);
      expect(state.isLast).toBe(true);
      expect(state.canGoNext).toBe(true);
      expect(state.canGoPrevious).toBe(true);
    });

    it("returns correct snapshot when complete", () => {
      const player = new DemoPlayer(makeConfig());
      player.next();
      player.next();
      player.next(); // complete

      const state = player.getState();
      expect(state.isComplete).toBe(true);
      expect(state.canGoNext).toBe(false);
    });

    it("works with single-step demo", () => {
      const player = new DemoPlayer(
        makeConfig({ steps: [makeStep({ id: "only" })] }),
      );
      const state = player.getState();

      expect(state.totalSteps).toBe(1);
      expect(state.isFirst).toBe(true);
      expect(state.isLast).toBe(true);
      expect(state.canGoNext).toBe(true);
      expect(state.canGoPrevious).toBe(false);
    });
  });

  describe("getCurrentStep()", () => {
    it("returns the current step object", () => {
      const player = new DemoPlayer(makeConfig());
      const step = player.getCurrentStep();

      expect(step.id).toBe("step-1");
      expect(step.orderIndex).toBe(0);
    });

    it("updates after navigation", () => {
      const player = new DemoPlayer(makeConfig());
      player.next();

      expect(player.getCurrentStep().id).toBe("step-2");
    });
  });
});
