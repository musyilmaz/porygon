import type { createAnalyticsRepository } from "@repo/db";
import type { createDemoRepository } from "@repo/db";
import { NotFoundError, ValidationError } from "@repo/shared";

type AnalyticsRepo = ReturnType<typeof createAnalyticsRepository>;
type DemoRepo = ReturnType<typeof createDemoRepository>;

interface AnalyticsServiceDeps {
  analyticsRepo: AnalyticsRepo;
  demoRepo: DemoRepo;
}

interface RecordViewInput {
  demoId: string;
  viewerHash: string;
  totalSteps: number;
  referrer?: string | null;
  userAgent?: string | null;
  country?: string | null;
}

interface UpdateViewInput {
  stepsViewed?: number;
  completed?: boolean;
  completedAt?: Date | null;
}

interface DateRange {
  from: Date;
  to: Date;
}

export function createAnalyticsService({
  analyticsRepo,
  demoRepo,
}: AnalyticsServiceDeps) {
  async function getPublishedDemoOrThrow(demoId: string) {
    const demo = await demoRepo.getById(demoId);
    if (!demo) {
      throw new NotFoundError("Demo not found");
    }
    if (demo.status !== "published") {
      throw new ValidationError("Demo is not published");
    }
    return demo;
  }

  async function getDemoOrThrow(demoId: string) {
    const demo = await demoRepo.getById(demoId);
    if (!demo) {
      throw new NotFoundError("Demo not found");
    }
    return demo;
  }

  return {
    async recordView(input: RecordViewInput) {
      await getPublishedDemoOrThrow(input.demoId);
      return analyticsRepo.recordView(input);
    },

    async updateView(viewId: string, input: UpdateViewInput) {
      const view = await analyticsRepo.updateView(viewId, input);
      if (!view) {
        throw new NotFoundError("View not found");
      }
      return view;
    },

    async getDemoAnalytics(demoId: string, dateRange?: DateRange) {
      await getDemoOrThrow(demoId);
      return analyticsRepo.getAggregates(demoId, dateRange);
    },

    async getDailyStats(demoId: string, dateRange?: DateRange) {
      await getDemoOrThrow(demoId);
      return analyticsRepo.getDailyStats(demoId, dateRange);
    },
  };
}
