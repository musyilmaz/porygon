export interface DemoAggregates {
  totalViews: number;
  uniqueViewers: number;
  completionRate: number;
  avgStepsViewed: number;
  topReferrers: { referrer: string; count: number }[];
}

export interface DailyStats {
  date: string;
  views: number;
  uniqueViewers: number;
  completions: number;
}

export interface StepDropoff {
  step: number;
  viewers: number;
}

export type DatePreset = "7d" | "30d" | "90d" | "all";
