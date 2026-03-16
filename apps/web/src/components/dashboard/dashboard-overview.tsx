"use client";

import type { DemoWithStats } from "@porygon/services";
import { Badge } from "@porygon/ui/components/badge";
import { Button } from "@porygon/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@porygon/ui/components/card";
import { toast } from "@porygon/ui/components/sonner";
import {
  BarChart3,
  Eye,
  Footprints,
  Play,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { apiError, fetchOpts } from "@/lib/editor/api-utils";

interface DashboardOverviewProps {
  demos: DemoWithStats[];
  workspaceId: string;
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

export function DashboardOverview({ demos, workspaceId }: DashboardOverviewProps) {
  const router = useRouter();

  const stats = useMemo(() => {
    const totalDemos = demos.length;
    const publishedDemos = demos.filter((d) => d.status === "published").length;
    const totalViews = demos.reduce((sum, d) => sum + d.totalViews, 0);
    const totalSteps = demos.reduce((sum, d) => sum + d.stepCount, 0);
    return { totalDemos, publishedDemos, totalViews, totalSteps };
  }, [demos]);

  const recentDemos = useMemo(
    () => [...demos].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ).slice(0, 5),
    [demos],
  );

  const topDemos = useMemo(
    () => [...demos].sort((a, b) => b.totalViews - a.totalViews).slice(0, 5),
    [demos],
  );

  async function handleCreate() {
    try {
      const res = await fetch("/api/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, title: "Untitled demo" }),
        ...fetchOpts,
      });
      if (!res.ok) {
        toast.error(await apiError(res));
        return;
      }
      const demo = await res.json();
      router.push(`/editor/${demo.id}`);
    } catch {
      toast.error("Failed to create demo");
    }
  }

  const metrics = [
    { label: "Total Demos", value: stats.totalDemos, icon: Play },
    { label: "Published", value: stats.publishedDemos, icon: BarChart3 },
    { label: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye },
    { label: "Total Steps", value: stats.totalSteps.toLocaleString(), icon: Footprints },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleCreate} size="sm">
          <Plus className="size-4" />
          Create demo
        </Button>
      </div>

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recently Updated</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/demos">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentDemos.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No demos yet. Create your first demo to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {recentDemos.map((demo) => (
                  <Link
                    key={demo.id}
                    href={`/editor/${demo.id}`}
                    className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{demo.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {demo.stepCount} {demo.stepCount === 1 ? "step" : "steps"}
                      </p>
                    </div>
                    <StatusBadge status={demo.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Most Viewed</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/analytics">Analytics</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topDemos.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No view data yet. Publish and share your demos to start collecting views.
              </p>
            ) : (
              <div className="space-y-3">
                {topDemos.map((demo) => (
                  <Link
                    key={demo.id}
                    href={`/dashboard/demos/${demo.id}/analytics`}
                    className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{demo.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {demo.totalViews.toLocaleString()} {demo.totalViews === 1 ? "view" : "views"}
                      </p>
                    </div>
                    <StatusBadge status={demo.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
