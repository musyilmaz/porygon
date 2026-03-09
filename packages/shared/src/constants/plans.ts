import type { Plan, PlanLimits } from "../types/workspace";

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxDemos: 10,
    maxStepsPerDemo: 25,
    maxWorkspaceMembers: 1,
    maxStorageMB: 500,
    customBranding: false,
    analyticsRetentionDays: 30,
  },
  pro: {
    maxDemos: 50,
    maxStepsPerDemo: 50,
    maxWorkspaceMembers: 5,
    maxStorageMB: 5_000,
    customBranding: true,
    analyticsRetentionDays: 90,
  },
  team: {
    maxDemos: 200,
    maxStepsPerDemo: 100,
    maxWorkspaceMembers: 20,
    maxStorageMB: 20_000,
    customBranding: true,
    analyticsRetentionDays: 365,
  },
  business: {
    maxDemos: -1,
    maxStepsPerDemo: -1,
    maxWorkspaceMembers: -1,
    maxStorageMB: 100_000,
    customBranding: true,
    analyticsRetentionDays: -1,
  },
} as const;
