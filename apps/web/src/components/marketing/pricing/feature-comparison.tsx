import { cn } from "@porygon/ui/lib/utils";
import { Check, Clock, Minus } from "lucide-react";

import {
  FEATURE_COMPARISON,
  type FeatureValue,
} from "@/components/marketing/pricing/constants";

const planNames = ["Free", "Pro", "Team", "Business"] as const;

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return <Check className="mx-auto size-4 text-violet-600" />;
  }
  if (value === false) {
    return <Minus className="mx-auto size-4 text-muted-foreground/40" />;
  }
  if (value === "coming-soon") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3" />
        Soon
      </span>
    );
  }
  return <span className="text-sm">{value}</span>;
}

export function FeatureComparison() {
  return (
    <section className="border-t py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Compare plans
        </h2>
        <p className="mt-3 text-center text-lg text-muted-foreground">
          Everything you get at every tier
        </p>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 bg-background py-3 pr-4 text-left font-semibold">
                  Feature
                </th>
                {planNames.map((name) => (
                  <th
                    key={name}
                    className={cn(
                      "px-4 py-3 text-center font-semibold",
                      name === "Pro" && "text-violet-600"
                    )}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_COMPARISON.map((row) => (
                <tr key={row.name} className="border-b last:border-b-0">
                  <td className="sticky left-0 bg-background py-3 pr-4 text-muted-foreground">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FeatureCell value={row.free} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FeatureCell value={row.pro} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FeatureCell value={row.team} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FeatureCell value={row.business} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
