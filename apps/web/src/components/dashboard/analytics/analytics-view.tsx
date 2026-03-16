"use client";

import { toast } from "@porygon/ui/components/sonner";
import { useCallback, useEffect, useState } from "react";

import { AnalyticsEmpty } from "./analytics-empty";
import { AnalyticsLoading } from "./analytics-loading";
import { DailyViewsChart } from "./daily-views-chart";
import { DateRangeSelect } from "./date-range-select";
import { MetricCards } from "./metric-cards";
import { StepDropoffChart } from "./step-dropoff-chart";
import { TopReferrersTable } from "./top-referrers-table";
import type { DailyStats, DatePreset, DemoAggregates, StepDropoff } from "./types";

import { apiError, fetchOpts } from "@/lib/editor/api-utils";

const presetToDays: Record<DatePreset, number | undefined> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: undefined,
};

interface AnalyticsViewProps {
  demoId: string;
}

export function AnalyticsView({ demoId }: AnalyticsViewProps) {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [loading, setLoading] = useState(true);
  const [aggregates, setAggregates] = useState<DemoAggregates | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [stepDropoff, setStepDropoff] = useState<StepDropoff[]>([]);

  const fetchData = useCallback(async (datePreset: DatePreset) => {
    setLoading(true);
    const days = presetToDays[datePreset];
    const qs = days ? `?days=${days}` : "";

    try {
      const [aggRes, dailyRes, dropoffRes] = await Promise.all([
        fetch(`/api/demos/${demoId}/analytics${qs}`, fetchOpts),
        fetch(`/api/demos/${demoId}/analytics/daily${qs}`, fetchOpts),
        fetch(`/api/demos/${demoId}/analytics/dropoff${qs}`, fetchOpts),
      ]);

      if (!aggRes.ok || !dailyRes.ok || !dropoffRes.ok) {
        const failedRes = [aggRes, dailyRes, dropoffRes].find((r) => !r.ok);
        toast.error(await apiError(failedRes!));
        return;
      }

      const [agg, daily, dropoff] = await Promise.all([
        aggRes.json() as Promise<DemoAggregates>,
        dailyRes.json() as Promise<DailyStats[]>,
        dropoffRes.json() as Promise<StepDropoff[]>,
      ]);

      setAggregates(agg);
      setDailyStats(daily);
      setStepDropoff(dropoff);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [demoId]);

  useEffect(() => {
    fetchData(preset);
  }, [preset, fetchData]);

  if (loading) {
    return <AnalyticsLoading />;
  }

  if (!aggregates || aggregates.totalViews === 0) {
    return <AnalyticsEmpty />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <DateRangeSelect value={preset} onChange={setPreset} />
      </div>

      <MetricCards aggregates={aggregates} />

      <DailyViewsChart data={dailyStats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <StepDropoffChart data={stepDropoff} />
        <TopReferrersTable referrers={aggregates.topReferrers} />
      </div>
    </div>
  );
}
