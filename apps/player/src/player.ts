import type {
  PlayerConfig,
  PlayerEventHandler,
  PlayerEventMap,
  PlayerEventType,
  PlayerHotspot,
  PlayerState,
  PlayerStep,
} from "./types";

export class DemoPlayer {
  private readonly steps: PlayerStep[];
  private readonly stepIndexById: Map<string, number>;
  private readonly hotspotIndex: Map<
    string,
    { hotspot: PlayerHotspot; stepIndex: number }
  >;
  private currentStepIndex: number;
  private history: number[];
  private isComplete: boolean;
  private listeners: Map<PlayerEventType, Set<PlayerEventHandler<never>>>;

  constructor(config: PlayerConfig) {
    if (config.steps.length === 0) {
      throw new Error("DemoPlayer requires at least one step");
    }

    this.steps = [...config.steps].sort((a, b) => a.orderIndex - b.orderIndex);

    this.stepIndexById = new Map();
    this.hotspotIndex = new Map();

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i]!;
      this.stepIndexById.set(step.id, i);

      for (const hotspot of step.hotspots) {
        this.hotspotIndex.set(hotspot.id, { hotspot, stepIndex: i });
      }
    }

    this.currentStepIndex = 0;
    this.history = [];
    this.isComplete = false;
    this.listeners = new Map();
  }

  next(): void {
    if (this.isComplete) return;

    if (this.currentStepIndex === this.steps.length - 1) {
      this.isComplete = true;
      this.emit("complete", { totalSteps: this.steps.length });
      return;
    }

    this.setStep(this.currentStepIndex + 1);
  }

  previous(): void {
    if (this.history.length === 0) return;

    const previousIndex = this.history.pop()!;
    this.isComplete = false;

    const fromIndex = this.currentStepIndex;
    this.currentStepIndex = previousIndex;

    this.emit("stepChange", {
      fromIndex,
      toIndex: previousIndex,
      step: this.steps[previousIndex]!,
    });
  }

  goToStep(stepId: string): void {
    const targetIndex = this.stepIndexById.get(stepId);
    if (targetIndex === undefined) {
      throw new Error(`Unknown step ID: ${stepId}`);
    }

    if (targetIndex === this.currentStepIndex) return;

    this.setStep(targetIndex);
  }

  navigateBranch(hotspotId: string): void {
    const entry = this.hotspotIndex.get(hotspotId);
    if (!entry) {
      throw new Error(`Unknown hotspot ID: ${hotspotId}`);
    }

    const { hotspot } = entry;
    if (hotspot.targetStepId === null) return;

    const targetIndex = this.stepIndexById.get(hotspot.targetStepId);
    if (targetIndex === undefined) {
      throw new Error(`Unknown target step ID: ${hotspot.targetStepId}`);
    }

    const fromIndex = this.currentStepIndex;

    this.emit("branchSelect", {
      hotspotId,
      fromIndex,
      toIndex: targetIndex,
    });

    this.setStep(targetIndex);
  }

  getState(): PlayerState {
    const step = this.steps[this.currentStepIndex]!;
    return {
      currentStepIndex: this.currentStepIndex,
      currentStep: step,
      totalSteps: this.steps.length,
      isFirst: this.currentStepIndex === 0,
      isLast: this.currentStepIndex === this.steps.length - 1,
      isComplete: this.isComplete,
      canGoNext: !this.isComplete,
      canGoPrevious: this.history.length > 0,
    };
  }

  getCurrentStep(): PlayerStep {
    return this.steps[this.currentStepIndex]!;
  }

  reset(): void {
    const fromIndex = this.currentStepIndex;
    this.currentStepIndex = 0;
    this.history = [];
    this.isComplete = false;

    this.emit("stepChange", {
      fromIndex,
      toIndex: 0,
      step: this.steps[0]!,
    });
  }

  on<T extends PlayerEventType>(
    event: T,
    handler: PlayerEventHandler<T>,
  ): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as PlayerEventHandler<never>);
  }

  off<T extends PlayerEventType>(
    event: T,
    handler: PlayerEventHandler<T>,
  ): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler as PlayerEventHandler<never>);
    }
  }

  private setStep(index: number): void {
    const fromIndex = this.currentStepIndex;
    this.history.push(fromIndex);
    this.currentStepIndex = index;
    this.isComplete = false;

    this.emit("stepChange", {
      fromIndex,
      toIndex: index,
      step: this.steps[index]!,
    });
  }

  private emit<T extends PlayerEventType>(
    event: T,
    payload: PlayerEventMap[T],
  ): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const handler of set) {
      (handler as PlayerEventHandler<T>)(payload);
    }
  }
}
