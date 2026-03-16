"use client";

import type { DemoWithStats } from "@porygon/services";
import { Badge } from "@porygon/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@porygon/ui/components/card";
import { BarChart3, Eye, Footprints, Users } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface AnalyticsOverviewProps {
  demos: DemoWithStats[];
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  published: { label: "Published", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
} as const;

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;
  if ("className" in config) {
    return <Badge className={config.className}>{config.label}</Badge>;
  }
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function AnalyticsOverview({ demos }: AnalyticsOverviewProps) {
  const stats = useMemo(() => {
    const totalViews = demos.reduce((sum, d) => sum + d.totalViews, 0);
    const publishedDemos = demos.filter((d) => d.status === "published").length;
    const totalSteps = demos.reduce((sum, d) => sum + d.stepCount, 0);
    return { totalViews, publishedDemos, totalSteps };
  }, [demos]);

  const demosByViews = useMemo(
    () => [...demos].sort((a, b) => b.totalViews - a.totalViews),
    [demos],
  );

  const metrics = [
    { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye },
    { label: "Published Demos", value: stats.publishedDemos, icon: Users },
    { label: "Total Steps", value: stats.totalSteps.toLocaleString(), icon: Footprints },
    { label: "Total Demos", value: demos.length, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="gap-2 py-4">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {m.label}
                </CardTitle>
                <m.icon className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demos by Views</CardTitle>
        </CardHeader>
        <CardContent>
          {demosByViews.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No demos yet. Create and publish demos to see analytics.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Demo</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Steps</th>
                  <th className="pb-2 text-right font-medium">Views</th>
                </tr>
              </thead>
              <tbody>
                {demosByViews.map((demo) => (
                  <tr key={demo.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link
                        href={`/dashboard/demos/${demo.id}/analytics`}
                        className="font-medium hover:underline"
                      >
                        {demo.title}
                      </Link>
                    </td>
                    <td className="py-2">
                      <StatusBadge status={demo.status} />
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {demo.stepCount}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {demo.totalViews.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
