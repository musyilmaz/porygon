"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@porygon/ui/components/card";
import { BarChart3, Eye, Footprints, Users } from "lucide-react";

import type { DemoAggregates } from "./types";

interface MetricCardsProps {
  aggregates: DemoAggregates;
}

export function MetricCards({ aggregates }: MetricCardsProps) {
  const metrics = [
    {
      label: "Total Views",
      value: aggregates.totalViews.toLocaleString(),
      icon: Eye,
    },
    {
      label: "Unique Viewers",
      value: aggregates.uniqueViewers.toLocaleString(),
      icon: Users,
    },
    {
      label: "Completion Rate",
      value: `${aggregates.completionRate}%`,
      icon: BarChart3,
    },
    {
      label: "Avg Steps Viewed",
      value: Number(aggregates.avgStepsViewed).toFixed(1),
      icon: Footprints,
    },
  ];

  return (
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
  );
}
