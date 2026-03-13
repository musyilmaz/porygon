// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

import { KeyboardHandler } from "./keyboard";

describe("KeyboardHandler", () => {
  let element: HTMLDivElement;
  let onNext: ReturnType<typeof vi.fn>;
  let onPrevious: ReturnType<typeof vi.fn>;
  let onEscape: ReturnType<typeof vi.fn>;
  let handler: KeyboardHandler;

  beforeEach(() => {
    element = document.createElement("div");
    document.body.appendChild(element);
    onNext = vi.fn();
    onPrevious = vi.fn();
    onEscape = vi.fn();
    handler = new KeyboardHandler(element, { onNext, onPrevious, onEscape });
  });

  function dispatchKey(key: string): KeyboardEvent {
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
    return event;
  }

  it("does not respond to keys before attach", () => {
    dispatchKey("ArrowRight");
    expect(onNext).not.toHaveBeenCalled();
  });

  it("calls onNext on ArrowRight", () => {
    handler.attach();
    dispatchKey("ArrowRight");
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("calls onPrevious on ArrowLeft", () => {
    handler.attach();
    dispatchKey("ArrowLeft");
    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it("calls onEscape on Escape", () => {
    handler.attach();
    dispatchKey("Escape");
    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("ignores unrelated keys", () => {
    handler.attach();
    dispatchKey("Enter");
    dispatchKey("Space");
    dispatchKey("a");
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrevious).not.toHaveBeenCalled();
    expect(onEscape).not.toHaveBeenCalled();
  });

  it("stops responding after detach", () => {
    handler.attach();
    handler.detach();
    dispatchKey("ArrowRight");
    expect(onNext).not.toHaveBeenCalled();
  });

  it("attach is idempotent", () => {
    handler.attach();
    handler.attach();
    dispatchKey("ArrowRight");
    // Should only fire once, not twice
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("detach is idempotent", () => {
    handler.attach();
    handler.detach();
    handler.detach(); // should not throw
    dispatchKey("ArrowRight");
    expect(onNext).not.toHaveBeenCalled();
  });

  it("prevents default on handled keys", () => {
    handler.attach();
    const event = dispatchKey("ArrowRight");
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not prevent default on unhandled keys", () => {
    handler.attach();
    const event = dispatchKey("Enter");
    expect(event.defaultPrevented).toBe(false);
  });
});
