"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@porygon/ui/components/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@porygon/ui/components/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { DailyStats } from "./types";

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--color-chart-1)",
  },
  uniqueViewers: {
    label: "Unique Viewers",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface DailyViewsChartProps {
  data: DailyStats[];
}

export function DailyViewsChart({ data }: DailyViewsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Views</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No view data for this period
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={formatDate} />}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="var(--color-views)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="uniqueViewers"
                stroke="var(--color-uniqueViewers)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
