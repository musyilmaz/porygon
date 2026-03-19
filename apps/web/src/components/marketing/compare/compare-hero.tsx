import { Badge } from "@porygon/ui/components/badge";

import type { CompetitorData } from "@/components/marketing/compare/constants";

interface CompareHeroProps {
  competitor: CompetitorData;
}

export function CompareHero({ competitor }: CompareHeroProps) {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Badge variant="secondary" className="text-violet-600">
          Side-by-side comparison
        </Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Porygon vs {competitor.name}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {competitor.tagline}
        </p>
      </div>
    </section>
  );
}
