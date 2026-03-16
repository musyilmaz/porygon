"use client";

import { PLAN_LIMITS } from "@porygon/shared";
import { Badge } from "@porygon/ui/components/badge";
import { Button } from "@porygon/ui/components/button";

import type { Workspace } from "@/components/dashboard/settings/workspace-settings";

function formatLimit(value: number, unit?: string) {
  if (value === -1) return "Unlimited";
  return `${value.toLocaleString()}${unit ? ` ${unit}` : ""}`;
}

function formatStorage(mb: number) {
  if (mb >= 1_000) return `${(mb / 1_000).toFixed(0)} GB`;
  return `${mb} MB`;
}

function formatRetention(days: number) {
  if (days === -1) return "Unlimited";
  if (days >= 365) return `${Math.floor(days / 365)} year`;
  return `${days} days`;
}

interface BillingTabProps {
  workspace: Workspace;
  memberCount: number;
  demoCount: number;
}

export function BillingTab({ workspace, memberCount, demoCount }: BillingTabProps) {
  const limits = PLAN_LIMITS[workspace.plan];

  const rows = [
    {
      label: "Demos",
      value:
        limits.maxDemos === -1
          ? "Unlimited"
          : `${demoCount} / ${limits.maxDemos}`,
    },
    { label: "Steps per demo", value: formatLimit(limits.maxStepsPerDemo) },
    {
      label: "Team members",
      value:
        limits.maxWorkspaceMembers === -1
          ? "Unlimited"
          : `${memberCount} / ${limits.maxWorkspaceMembers}`,
    },
    { label: "Storage", value: formatStorage(limits.maxStorageMB) },
    { label: "Custom branding", value: limits.customBranding ? "Yes" : "No" },
    {
      label: "Analytics retention",
      value: formatRetention(limits.analyticsRetentionDays),
    },
  ];

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Current plan</h2>
        <Badge variant="secondary" className="capitalize">
          {workspace.plan}
        </Badge>
      </div>

      <div className="rounded-lg border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
          >
            <span className="text-sm text-muted-foreground">{row.label}</span>
            <span className="text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </div>

      <Button disabled>
        Upgrade plan (coming soon)
      </Button>
    </div>
  );
}
