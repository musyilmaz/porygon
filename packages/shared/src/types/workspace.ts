export type Plan = "free" | "pro" | "team" | "business";

export interface PlanLimits {
  maxDemos: number;
  maxStepsPerDemo: number;
  maxWorkspaceMembers: number;
  maxStorageMB: number;
  customBranding: boolean;
  analyticsRetentionDays: number;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
