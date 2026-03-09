export interface DemoView {
  id: string;
  demoId: string;
  viewerHash: string | null;
  stepsViewed: number;
  totalSteps: number;
  completed: boolean;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  startedAt: Date;
  completedAt: Date | null;
}
