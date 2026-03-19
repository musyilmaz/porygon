import { Badge } from "@porygon/ui/components/badge";
import { cn } from "@porygon/ui/lib/utils";

import type { CompetitorData } from "@/components/marketing/compare/constants";

interface VerdictProps {
  competitor: CompetitorData;
}

export function Verdict({ competitor }: VerdictProps) {
  return (
    <section className="border-t py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          The verdict
        </h2>
        <p className="mt-3 text-center text-lg text-muted-foreground">
          Where each platform wins — and where Porygon comes out ahead
        </p>

        <div className="mt-12 space-y-4">
          {competitor.verdict.map((point) => (
            <div
              key={point.title}
              className="rounded-xl border bg-background p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold">{point.title}</h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    "shrink-0",
                    point.winner === "porygon" &&
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                    point.winner === "competitor" &&
                      "bg-muted text-muted-foreground",
                    point.winner === "tie" &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {point.winner === "porygon"
                    ? "Porygon"
                    : point.winner === "competitor"
                      ? competitor.name
                      : "Tie"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
