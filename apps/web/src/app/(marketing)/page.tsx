import type { Metadata } from "next";

import { Features } from "@/components/marketing/landing/features";
import { FinalCTA } from "@/components/marketing/landing/final-cta";
import { Hero } from "@/components/marketing/landing/hero";
import { LogoWall } from "@/components/marketing/landing/logo-wall";
import { Personas } from "@/components/marketing/landing/personas";
import { PricingPreview } from "@/components/marketing/landing/pricing-preview";
import { ProductPreview } from "@/components/marketing/landing/product-preview";
import { Testimonials } from "@/components/marketing/landing/testimonials";

export const metadata: Metadata = {
  title: {
    absolute: "dot · Interactive product demos",
  },
  description:
    "Interactive product demos that sell your product. Branching, narrated, measured — don't tell, show.",
  openGraph: {
    title: "dot · Interactive product demos",
    description:
      "The interactive demo platform built for teams who sell by showing. Branching flows, smart hotspots, analytics that matter.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "dot · Interactive product demos",
    description:
      "Interactive demos that sell your product. Don't tell — show.",
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
      <LogoWall />
      <Features />
      <Personas />
      <ProductPreview />
      <PricingPreview />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
