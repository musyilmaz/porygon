import type { DemoPlayer } from "./player";
import type { PlayerStep } from "./types";

export interface PlayerAnalyticsOptions {
  apiBaseUrl: string;
  demoId: string;
  totalSteps: number;
}

/**
 * FNV-1a hash — produces a stable viewer fingerprint from browser traits.
 * Zero dependencies, ~10 lines.
 */
function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

function getViewerHash(): string {
  const parts = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}`,
    String(new Date().getTimezoneOffset()),
  ];
  return fnv1aHash(parts.join("|"));
}

export class PlayerAnalytics {
  private readonly apiBaseUrl: string;
  private readonly demoId: string;
  private readonly totalSteps: number;

  private viewId: string | null = null;
  private maxStepReached = 0;
  private stepsSinceFlush = 0;
  private dirty = false;
  private completed = false;
  private destroyed = false;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  private readonly boundOnVisibilityChange: () => void;
  private readonly boundOnStepChange: (payload: {
    fromIndex: number;
    toIndex: number;
    step: PlayerStep;
  }) => void;
  private readonly boundOnComplete: () => void;

  private player: DemoPlayer | null = null;

  constructor(options: PlayerAnalyticsOptions) {
    this.apiBaseUrl = options.apiBaseUrl;
    this.demoId = options.demoId;
    this.totalSteps = options.totalSteps;

    this.boundOnStepChange = (payload) => this.handleStepChange(payload);
    this.boundOnComplete = () => this.handleComplete();
    this.boundOnVisibilityChange = () => this.handleVisibilityChange();
  }

  attach(player: DemoPlayer): void {
    this.player = player;
    player.on("stepChange", this.boundOnStepChange);
    player.on("complete", this.boundOnComplete);
    document.addEventListener("visibilitychange", this.boundOnVisibilityChange);

    this.flushTimer = setInterval(() => this.flush(false), 30_000);
  }

  start(): void {
    const body = {
      demoId: this.demoId,
      viewerHash: getViewerHash(),
      totalSteps: this.totalSteps,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent || null,
    };

    fetch(`${this.apiBaseUrl}/api/analytics/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((data: unknown) => {
        if (data && typeof data === "object" && "id" in data) {
          this.viewId = (data as { id: string }).id;
        }
      })
      .catch(() => {
        // Silent failure — viewId stays null, all subsequent ops become no-ops
      });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    document.removeEventListener(
      "visibilitychange",
      this.boundOnVisibilityChange,
    );

    if (this.player) {
      this.player.off("stepChange", this.boundOnStepChange);
      this.player.off("complete", this.boundOnComplete);
      this.player = null;
    }

    this.flush(true);
  }

  private handleStepChange(payload: { toIndex: number }): void {
    if (!this.viewId || this.destroyed) return;

    this.maxStepReached = Math.max(this.maxStepReached, payload.toIndex);
    this.dirty = true;
    this.stepsSinceFlush++;

    if (this.stepsSinceFlush >= 5) {
      this.flush(false);
    }
  }

  private handleComplete(): void {
    if (!this.viewId || this.destroyed || this.completed) return;
    this.completed = true;

    // Flush pending steps first, then mark completed
    this.sendPatch(
      {
        stepsViewed: this.maxStepReached + 1,
        completed: true,
        completedAt: new Date().toISOString(),
      },
      false,
    );
    this.dirty = false;
    this.stepsSinceFlush = 0;
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === "hidden") {
      this.flush(true);
    }
  }

  private flush(keepalive: boolean): void {
    if (!this.viewId || !this.dirty) return;

    this.sendPatch({ stepsViewed: this.maxStepReached + 1 }, keepalive);
    this.dirty = false;
    this.stepsSinceFlush = 0;
  }

  private sendPatch(body: Record<string, unknown>, keepalive: boolean): void {
    fetch(`${this.apiBaseUrl}/api/analytics/views/${this.viewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive,
    }).catch(() => {
      // Silent failure
    });
  }
}
