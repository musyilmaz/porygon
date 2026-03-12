import type { Nullable } from "@repo/shared";
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  isNotNull,
  lte,
  sql,
} from "drizzle-orm";

import type { Database } from "../client";
import { demoViews } from "../schema/demo-views";

export interface DateRange {
  from: Date;
  to: Date;
}

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

interface RecordViewData {
  demoId: string;
  viewerHash: string;
  totalSteps: number;
  referrer?: Nullable<string>;
  userAgent?: Nullable<string>;
  country?: Nullable<string>;
}

interface UpdateViewData {
  stepsViewed?: number;
  completed?: boolean;
  completedAt?: Nullable<Date>;
}

// Percentage of views where the viewer reached completion (guarded against division by zero)
const completionRateSql = sql<number>`
  CASE WHEN COUNT(*) = 0 THEN 0
  ELSE ROUND(COUNT(*) FILTER (WHERE ${demoViews.completed})::numeric / COUNT(*)::numeric * 100, 2)
  END
`;

// Falls back to 0 when there are no views
const avgStepsViewedSql = sql<number>`COALESCE(AVG(${demoViews.stepsViewed}), 0)`;

// Truncates timestamps to calendar dates for daily bucketing
const dailyBucketSql = sql<string>`DATE_TRUNC('day', ${demoViews.startedAt})::date`;

// Count of views where the viewer reached completion
const completionCountSql = sql<number>`COUNT(*) FILTER (WHERE ${demoViews.completed})`;

export function createAnalyticsRepository(db: Database) {
  function buildConditions(demoId: string, dateRange?: DateRange) {
    const conditions = [eq(demoViews.demoId, demoId)];
    if (dateRange) {
      conditions.push(gte(demoViews.startedAt, dateRange.from));
      conditions.push(lte(demoViews.startedAt, dateRange.to));
    }
    return conditions;
  }

  return {
    async recordView(data: RecordViewData) {
      const [view] = await db.insert(demoViews).values(data).returning();
      return view!;
    },

    async updateView(id: string, data: UpdateViewData) {
      const [view] = await db
        .update(demoViews)
        .set(data)
        .where(eq(demoViews.id, id))
        .returning();
      return view;
    },

    async getByDemo(demoId: string, dateRange?: DateRange) {
      const conditions = buildConditions(demoId, dateRange);
      return db
        .select()
        .from(demoViews)
        .where(and(...conditions))
        .orderBy(desc(demoViews.startedAt));
    },

    async getAggregates(
      demoId: string,
      dateRange?: DateRange,
    ): Promise<DemoAggregates> {
      const conditions = buildConditions(demoId, dateRange);
      const whereClause = and(...conditions);

      const [stats] = await db
        .select({
          totalViews: count(),
          uniqueViewers: countDistinct(demoViews.viewerHash),
          completionRate: completionRateSql,
          avgStepsViewed: avgStepsViewedSql,
        })
        .from(demoViews)
        .where(whereClause);

      const topReferrers = await db
        .select({
          referrer: demoViews.referrer,
          count: count(),
        })
        .from(demoViews)
        .where(and(...conditions, isNotNull(demoViews.referrer)))
        .groupBy(demoViews.referrer)
        .orderBy(desc(count()))
        .limit(10);

      return {
        totalViews: stats!.totalViews,
        uniqueViewers: stats!.uniqueViewers,
        completionRate: Number(stats!.completionRate),
        avgStepsViewed: Number(stats!.avgStepsViewed),
        topReferrers: topReferrers as { referrer: string; count: number }[],
      };
    },

    async getDailyStats(
      demoId: string,
      dateRange?: DateRange,
    ): Promise<DailyStats[]> {
      const conditions = buildConditions(demoId, dateRange);

      return db
        .select({
          date: dailyBucketSql,
          views: count(),
          uniqueViewers: countDistinct(demoViews.viewerHash),
          completions: completionCountSql,
        })
        .from(demoViews)
        .where(and(...conditions))
        .groupBy(dailyBucketSql)
        .orderBy(asc(dailyBucketSql));
    },
  };
}
