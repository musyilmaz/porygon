"use client";

import { Button } from "@porygon/ui/components/button";
import { Input } from "@porygon/ui/components/input";
import { Label } from "@porygon/ui/components/label";
import { toast } from "@porygon/ui/components/sonner";
import { useState } from "react";

import type { Workspace } from "@/components/dashboard/settings/workspace-settings";
import { apiError, fetchOpts } from "@/lib/editor/api-utils";

interface GeneralTabProps {
  workspace: Workspace;
  onUpdate: (workspace: Workspace) => void;
}

export function GeneralTab({ workspace, onUpdate }: GeneralTabProps) {
  const [name, setName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug);
  const [saving, setSaving] = useState(false);

  const hasChanges = name !== workspace.name || slug !== workspace.slug;

  async function handleSave() {
    setSaving(true);
    const prev = { name: workspace.name, slug: workspace.slug };
    onUpdate({ ...workspace, name, slug });

    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
        ...fetchOpts,
      });
      if (!res.ok) {
        onUpdate({ ...workspace, ...prev });
        setName(prev.name);
        setSlug(prev.slug);
        toast.error(await apiError(res));
        return;
      }
      const updated = await res.json();
      onUpdate({ ...workspace, ...updated });
      toast.success("Workspace updated");
    } catch {
      onUpdate({ ...workspace, ...prev });
      setName(prev.name);
      setSlug(prev.slug);
      toast.error("Failed to update workspace");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="space-y-2">
        <Label htmlFor="workspace-name">Workspace name</Label>
        <Input
          id="workspace-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workspace-slug">Workspace slug</Label>
        <Input
          id="workspace-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Your workspace URL: <span className="font-mono text-foreground">{slug}</span>
        </p>
      </div>

      <Button onClick={handleSave} disabled={!hasChanges || saving}>
        {saving ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
