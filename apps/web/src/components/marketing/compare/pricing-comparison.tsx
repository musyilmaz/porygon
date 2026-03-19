import { Badge } from "@porygon/ui/components/badge";
import { cn } from "@porygon/ui/lib/utils";

import type { CompetitorData } from "@/components/marketing/compare/constants";

interface PricingComparisonProps {
  competitor: CompetitorData;
}

export function PricingComparison({ competitor }: PricingComparisonProps) {
  return (
    <section className="border-t py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Pricing comparison
        </h2>
        <p className="mt-3 text-center text-lg text-muted-foreground">
          See exactly what you pay — {competitor.name} vs Porygon
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Competitor plans */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-muted-foreground">
              {competitor.name}
            </h3>
            <div className="space-y-3">
              {competitor.competitorPlans.map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-xl border bg-background p-4"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-sm font-semibold">{plan.price}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {plan.notes.map((note) => (
                      <li
                        key={note}
                        className="text-sm text-muted-foreground"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Porygon plans */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-violet-600">
              Porygon
            </h3>
            <div className="space-y-3">
              {competitor.porygonPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "rounded-xl border bg-background p-4",
                    plan.name === "Pro" &&
                      "border-violet-400 ring-1 ring-violet-400"
                  )}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-sm font-semibold">{plan.price}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {plan.notes.map((note) => (
                      <li
                        key={note}
                        className="text-sm text-muted-foreground"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings callout */}
        <div className="mt-8 rounded-xl border border-violet-400 bg-violet-50 p-4 text-center dark:bg-violet-950/20">
          <Badge className="bg-violet-600 text-white">Savings</Badge>
          <p className="mt-2 font-medium">{competitor.savingsCallout}</p>
        </div>
      </div>
    </section>
  );
}
