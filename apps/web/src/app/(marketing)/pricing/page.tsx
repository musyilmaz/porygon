import type { Metadata } from "next";

import { FinalCTA } from "@/components/marketing/landing/final-cta";
import { FeatureComparison } from "@/components/marketing/pricing/feature-comparison";
import { PricingFAQ } from "@/components/marketing/pricing/pricing-faq";
import { PricingHero } from "@/components/marketing/pricing/pricing-hero";
import { PricingSection } from "@/components/marketing/pricing/pricing-section";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, flat pricing for interactive demos. No per-seat fees, no surprises. Free forever with 10 demos, or upgrade for unlimited.",
  openGraph: {
    title: "Pricing — Porygon",
    description:
      "Simple, flat pricing for interactive demos. No per-seat fees, no surprises. Free forever with 10 demos, or upgrade for unlimited.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Porygon",
    description:
      "Simple, flat pricing for interactive demos. No per-seat fees, no surprises.",
  },
};

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingSection />
      <FeatureComparison />
      <PricingFAQ />
      <FinalCTA />
    </>
  );
}
