import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { AutoplayTimer } from "./autoplay";

describe("AutoplayTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onTick at the specified interval", () => {
    const onTick = vi.fn();
    const timer = new AutoplayTimer(1000, onTick);

    timer.start();
    expect(onTick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(2);

    timer.destroy();
  });

  it("does not tick when paused", () => {
    const onTick = vi.fn();
    const timer = new AutoplayTimer(1000, onTick);

    timer.start();
    timer.pause();

    vi.advanceTimersByTime(3000);
    expect(onTick).not.toHaveBeenCalled();

    timer.destroy();
  });

  it("resumes ticking after resume", () => {
    const onTick = vi.fn();
    const timer = new AutoplayTimer(1000, onTick);

    timer.start();
    timer.pause();
    vi.advanceTimersByTime(1000);
    expect(onTick).not.toHaveBeenCalled();

    timer.resume();
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledOnce();

    timer.destroy();
  });

  it("stop clears the timer", () => {
    const onTick = vi.fn();
    const timer = new AutoplayTimer(1000, onTick);

    timer.start();
    timer.stop();

    vi.advanceTimersByTime(5000);
    expect(onTick).not.toHaveBeenCalled();
  });

  it("start resets a running timer", () => {
    const onTick = vi.fn();
    const timer = new AutoplayTimer(1000, onTick);

    timer.start();
    vi.advanceTimersByTime(500);

    // Restart — should reset the interval
    timer.start();
    vi.advanceTimersByTime(500);
    expect(onTick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(onTick).toHaveBeenCalledOnce();

    timer.destroy();
  });

  it("destroy stops ticking", () => {
    const onTick = vi.fn();
    const timer = new AutoplayTimer(1000, onTick);

    timer.start();
    timer.destroy();

    vi.advanceTimersByTime(5000);
    expect(onTick).not.toHaveBeenCalled();
  });

  it("isRunning returns correct state", () => {
    const timer = new AutoplayTimer(1000, vi.fn());

    expect(timer.isRunning()).toBe(false);

    timer.start();
    expect(timer.isRunning()).toBe(true);

    timer.pause();
    expect(timer.isRunning()).toBe(false);

    timer.resume();
    expect(timer.isRunning()).toBe(true);

    timer.stop();
    expect(timer.isRunning()).toBe(false);
  });

  it("uses custom delay", () => {
    const onTick = vi.fn();
    const timer = new AutoplayTimer(500, onTick);

    timer.start();
    vi.advanceTimersByTime(500);
    expect(onTick).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(500);
    expect(onTick).toHaveBeenCalledTimes(2);

    timer.destroy();
  });
});
