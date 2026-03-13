export class AutoplayTimer {
  private readonly delay: number;
  private readonly onTick: () => void;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private paused = false;

  constructor(delay: number, onTick: () => void) {
    this.delay = delay;
    this.onTick = onTick;
  }

  start(): void {
    this.stop();
    this.paused = false;
    this.timerId = setInterval(() => {
      if (!this.paused) {
        this.onTick();
      }
    }, this.delay);
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.paused = false;
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  destroy(): void {
    this.stop();
  }

  isRunning(): boolean {
    return this.timerId !== null && !this.paused;
  }
}
