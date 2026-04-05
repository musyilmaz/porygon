import type { Metadata } from "next";

import { FAQ } from "@/components/marketing/landing/faq";
import { Features } from "@/components/marketing/landing/features";
import { FinalCTA } from "@/components/marketing/landing/final-cta";
import { Hero } from "@/components/marketing/landing/hero";
import { PricingPreview } from "@/components/marketing/landing/pricing-preview";
import { Stats } from "@/components/marketing/landing/stats";

export const metadata: Metadata = {
  title: {
    absolute: "dot — Interactive Demo Builder",
  },
  description:
    "Create interactive product demos in minutes. Flat pricing — not per seat. No watermarks. 10 free demos included.",
  openGraph: {
    title: "dot — The Demo Builder That Doesn't Charge Per Seat",
    description:
      "Create interactive product demos in minutes. $20/mo flat. No watermarks. 10 free demos included.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "dot — The Demo Builder That Doesn't Charge Per Seat",
    description:
      "Interactive product demos in minutes. $20/mo flat — not per seat. No watermarks.",
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
      <Stats />
      <Features />
      <PricingPreview />
      <FAQ />
      <FinalCTA />
    </>
  );
}
