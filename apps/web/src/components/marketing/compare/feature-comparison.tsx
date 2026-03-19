import { cn } from "@porygon/ui/lib/utils";
import { Check, Minus } from "lucide-react";

import type { CompetitorData } from "@/components/marketing/compare/constants";

interface FeatureComparisonProps {
  competitor: CompetitorData;
}

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="mx-auto size-4 text-violet-600" />;
  }
  if (value === false) {
    return <Minus className="mx-auto size-4 text-muted-foreground/40" />;
  }
  return <span className="text-sm">{value}</span>;
}

export function FeatureComparison({ competitor }: FeatureComparisonProps) {
  return (
    <section className="border-t bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Feature comparison
        </h2>
        <p className="mt-3 text-center text-lg text-muted-foreground">
          How {competitor.name} and Porygon stack up feature by feature
        </p>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 bg-muted/30 py-3 pr-4 text-left font-semibold">
                  Feature
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  {competitor.name}
                </th>
                <th
                  className={cn(
                    "px-4 py-3 text-center font-semibold text-violet-600"
                  )}
                >
                  Porygon
                </th>
              </tr>
            </thead>
            <tbody>
              {competitor.features.map((row) => (
                <tr key={row.feature} className="border-b last:border-b-0">
                  <td className="sticky left-0 bg-muted/30 py-3 pr-4 text-muted-foreground">
                    {row.feature}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FeatureCell value={row.competitor} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FeatureCell value={row.porygon} />
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
