"use client";

import { Button } from "@porygon/ui/components/button";
import { Play, Plus, SearchX } from "lucide-react";

interface DemoEmptyStateProps {
  hasFilters: boolean;
  onCreate: () => void;
}

export function DemoEmptyState({ hasFilters, onCreate }: DemoEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <SearchX className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No demos found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
        <Play className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No demos yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Create your first interactive demo to get started.
      </p>
      <Button onClick={onCreate} className="mt-4" size="sm">
        <Plus className="size-4" />
        Create demo
      </Button>
    </div>
  );
}
