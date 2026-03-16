import { BarChart3 } from "lucide-react";

export function AnalyticsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <BarChart3 className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No analytics data yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Analytics will appear here once your demo has been viewed. Share your demo
        to start collecting data.
      </p>
    </div>
  );
}
