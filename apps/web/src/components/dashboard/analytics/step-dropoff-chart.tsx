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
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import type { StepDropoff } from "./types";

const chartConfig = {
  viewers: {
    label: "Viewers",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

interface StepDropoffChartProps {
  data: StepDropoff[];
}

export function StepDropoffChart({ data }: StepDropoffChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step Drop-off</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No step data for this period
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
            <BarChart data={data}>
              <XAxis
                dataKey="step"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v: number) => `Step ${v}`}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(v: string) => `Step ${v}`}
                  />
                }
              />
              <Bar
                dataKey="viewers"
                fill="var(--color-viewers)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
