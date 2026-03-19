import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CompareHero } from "@/components/marketing/compare/compare-hero";
import {
  COMPETITORS,
  VALID_COMPETITORS,
  type CompetitorSlug,
} from "@/components/marketing/compare/constants";
import { FeatureComparison } from "@/components/marketing/compare/feature-comparison";
import { PricingComparison } from "@/components/marketing/compare/pricing-comparison";
import { Verdict } from "@/components/marketing/compare/verdict";
import { FinalCTA } from "@/components/marketing/landing/final-cta";

interface Props {
  params: Promise<{ competitor: string }>;
}

export function generateStaticParams() {
  return VALID_COMPETITORS.map((competitor) => ({ competitor }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { competitor } = await params;
  const data = COMPETITORS[competitor as CompetitorSlug];

  if (!data) {
    return { title: "Not Found" };
  }

  return {
    title: data.seo.title,
    description: data.seo.description,
    openGraph: {
      title: data.seo.title.absolute,
      description: data.seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: data.seo.title.absolute,
      description: data.seo.description,
    },
  };
}

export default async function ComparePage({ params }: Props) {
  const { competitor } = await params;
  const data = COMPETITORS[competitor as CompetitorSlug];

  if (!data) {
    notFound();
  }

  return (
    <>
      <CompareHero competitor={data} />
      <PricingComparison competitor={data} />
      <FeatureComparison competitor={data} />
      <Verdict competitor={data} />
      <FinalCTA />
    </>
  );
}
