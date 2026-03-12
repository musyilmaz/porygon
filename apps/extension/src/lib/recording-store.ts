import type { CapturedStep } from "@/types/recording";

let steps: CapturedStep[] = [];

export function addStep(step: CapturedStep): number {
  steps.push(step);
  return steps.length - 1;
}

export function getSteps(): CapturedStep[] {
  return steps;
}

export function getStepCount(): number {
  return steps.length;
}

export function clearSteps(): void {
  steps = [];
}
