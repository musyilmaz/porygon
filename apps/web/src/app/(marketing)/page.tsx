import type { Metadata } from "next";

import { Features } from "@/components/marketing/landing/features";
import { FinalCTA } from "@/components/marketing/landing/final-cta";
import { Hero } from "@/components/marketing/landing/hero";
import { HowItWorks } from "@/components/marketing/landing/how-it-works";
import { PricingPreview } from "@/components/marketing/landing/pricing-preview";
import { ProductPreview } from "@/components/marketing/landing/product-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Porygon — Interactive Demo Builder",
  },
  description:
    "Create interactive product demos in minutes. Capture with a Chrome extension, add hotspots and tooltips, share anywhere. Free forever, no watermarks.",
  openGraph: {
    title: "Porygon — Interactive Demo Builder",
    description:
      "Create interactive product demos in minutes. Capture with a Chrome extension, add hotspots and tooltips, share anywhere. Free forever, no watermarks.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Porygon — Interactive Demo Builder",
    description:
      "Create interactive product demos in minutes. Capture with a Chrome extension, add hotspots and tooltips, share anywhere.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ProductPreview />
      <Features />
      <PricingPreview />
      <FinalCTA />
    </>
  );
}
