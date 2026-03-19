export type CompetitorSlug = "arcade" | "storylane" | "supademo";

export interface CompetitorPlan {
  name: string;
  price: string;
  notes: string[];
}

export interface CompareFeatureRow {
  feature: string;
  competitor: boolean | string;
  porygon: boolean | string;
}

export interface VerdictPoint {
  title: string;
  description: string;
  winner: "porygon" | "competitor" | "tie";
}

export interface CompetitorData {
  name: string;
  slug: CompetitorSlug;
  tagline: string;
  competitorPlans: CompetitorPlan[];
  porygonPlans: CompetitorPlan[];
  savingsCallout: string;
  features: CompareFeatureRow[];
  verdict: VerdictPoint[];
  seo: {
    title: { absolute: string };
    description: string;
  };
}

export const VALID_COMPETITORS: CompetitorSlug[] = [
  "arcade",
  "storylane",
  "supademo",
];

const PORYGON_PLANS: CompetitorPlan[] = [
  {
    name: "Free",
    price: "$0/mo",
    notes: ["1 seat", "10 demos", "No watermark"],
  },
  {
    name: "Pro",
    price: "$20/mo",
    notes: ["1 seat", "Unlimited demos", "Full analytics"],
  },
  {
    name: "Team",
    price: "$50/mo",
    notes: ["5 seats", "Unlimited demos", "Team workspace"],
  },
  {
    name: "Business",
    price: "$99/mo",
    notes: ["15 seats", "Unlimited demos", "Priority support"],
  },
];

export const COMPETITORS: Record<CompetitorSlug, CompetitorData> = {
  arcade: {
    name: "Arcade",
    slug: "arcade",
    tagline:
      "Get the same interactive demos at a fraction of the cost — no per-seat pricing, no watermarks on free.",
    competitorPlans: [
      {
        name: "Free",
        price: "$0/mo",
        notes: ["3 demos", "Watermark", "Limited features"],
      },
      {
        name: "Pro",
        price: "$32/user/mo",
        notes: ["Per-seat pricing", "Unlimited demos", "Custom branding"],
      },
      {
        name: "Growth",
        price: "$42.50/user/mo",
        notes: ["$212.50/mo for 5 users", "Advanced analytics", "Branching"],
      },
      {
        name: "Enterprise",
        price: "Custom",
        notes: ["Custom pricing", "SSO", "Dedicated support"],
      },
    ],
    porygonPlans: PORYGON_PLANS,
    savingsCallout:
      "Team of 5: $212.50/mo with Arcade → $50/mo with Porygon — 4.3x cheaper",
    features: [
      { feature: "Free demos", competitor: "3", porygon: "10" },
      { feature: "Free watermark", competitor: true, porygon: false },
      {
        feature: "Pricing model",
        competitor: "Per seat",
        porygon: "Flat rate",
      },
      { feature: "Branching / Multi-path", competitor: true, porygon: true },
      { feature: "Embed anywhere", competitor: true, porygon: true },
      { feature: "Custom branding", competitor: "Paid only", porygon: "Pro+" },
      { feature: "Analytics", competitor: true, porygon: true },
      {
        feature: "GIF / Video export",
        competitor: "Paid only",
        porygon: "Pro+",
      },
      { feature: "Team workspace", competitor: true, porygon: true },
      { feature: "Password protection", competitor: true, porygon: true },
    ],
    verdict: [
      {
        title: "Pricing",
        description:
          "Arcade charges $32–$42.50 per user per month. Porygon offers flat-rate plans starting at $20/mo with no per-seat fees — 4.3x cheaper for a team of 5.",
        winner: "porygon",
      },
      {
        title: "Free tier",
        description:
          "Arcade's free plan includes 3 demos with a watermark. Porygon gives you 10 demos with no watermark.",
        winner: "porygon",
      },
      {
        title: "Pricing model",
        description:
          "Arcade uses per-seat pricing that scales with your team. Porygon uses flat pricing — your cost stays predictable as you grow.",
        winner: "porygon",
      },
      {
        title: "Feature access",
        description:
          "Both platforms offer branching, embeds, analytics, and team workspaces. Feature parity is close on paid plans.",
        winner: "tie",
      },
      {
        title: "Market presence",
        description:
          "Arcade has 20,000+ customers and a proven track record. Porygon is newer but built for teams who want the same power without the price tag.",
        winner: "competitor",
      },
    ],
    seo: {
      title: { absolute: "Porygon vs Arcade — Compare Interactive Demo Tools" },
      description:
        "Compare Porygon and Arcade side by side. See how Porygon delivers interactive demos at 4.3x lower cost with no per-seat pricing.",
    },
  },

  storylane: {
    name: "Storylane",
    slug: "storylane",
    tagline:
      "Same interactive demos, 10x lower cost — flat pricing, no watermarks on free, and no surprise invoices.",
    competitorPlans: [
      {
        name: "Free",
        price: "$0/mo",
        notes: ["1 demo", "Watermark", "Limited features"],
      },
      {
        name: "Starter",
        price: "$40/mo",
        notes: ["1 seat", "Unlimited demos", "Basic analytics"],
      },
      {
        name: "Growth",
        price: "$500/mo",
        notes: ["5 seats", "Advanced analytics", "Custom branding"],
      },
      {
        name: "Premium",
        price: "$1,200/mo",
        notes: ["Unlimited seats", "SSO", "Dedicated support"],
      },
    ],
    porygonPlans: PORYGON_PLANS,
    savingsCallout:
      "Team of 5: $500/mo with Storylane → $50/mo with Porygon — 10x cheaper",
    features: [
      { feature: "Free demos", competitor: "1", porygon: "10" },
      { feature: "Free watermark", competitor: true, porygon: false },
      {
        feature: "Pricing model",
        competitor: "Tiered",
        porygon: "Flat rate",
      },
      { feature: "Branching / Multi-path", competitor: true, porygon: true },
      { feature: "Embed anywhere", competitor: true, porygon: true },
      {
        feature: "Custom branding",
        competitor: "Growth+",
        porygon: "Pro+",
      },
      { feature: "Analytics", competitor: true, porygon: true },
      {
        feature: "GIF / Video export",
        competitor: "Paid only",
        porygon: "Pro+",
      },
      { feature: "Team workspace", competitor: true, porygon: true },
      { feature: "Password protection", competitor: true, porygon: true },
    ],
    verdict: [
      {
        title: "Pricing",
        description:
          "Storylane's Growth plan is $500/mo for 5 seats. Porygon Team is $50/mo for 5 seats — 10x cheaper with comparable features.",
        winner: "porygon",
      },
      {
        title: "Free tier",
        description:
          "Storylane limits free users to 1 demo with a watermark. Porygon gives you 10 demos with no watermark.",
        winner: "porygon",
      },
      {
        title: "Pricing model",
        description:
          "Storylane uses steep tier jumps ($40 → $500 → $1,200). Porygon offers gradual, predictable pricing at every level.",
        winner: "porygon",
      },
      {
        title: "Feature access",
        description:
          "Both platforms cover branching, embeds, analytics, and team workspaces. Storylane gates custom branding to Growth ($500/mo); Porygon includes it from Pro ($20/mo).",
        winner: "porygon",
      },
    ],
    seo: {
      title: {
        absolute: "Porygon vs Storylane — Compare Interactive Demo Tools",
      },
      description:
        "Compare Porygon and Storylane side by side. See how Porygon delivers interactive demos at 10x lower cost with flat, predictable pricing.",
    },
  },

  supademo: {
    name: "Supademo",
    slug: "supademo",
    tagline:
      "Everything Supademo offers, at 7x lower cost — flat pricing, more free demos, and no watermarks.",
    competitorPlans: [
      {
        name: "Free",
        price: "$0/mo",
        notes: ["5 demos", "Watermark", "Limited features"],
      },
      {
        name: "Scale",
        price: "$38/creator/mo",
        notes: ["Per-creator pricing", "Unlimited demos", "Custom branding"],
      },
      {
        name: "Growth",
        price: "$350/mo",
        notes: ["5 creators", "Advanced analytics", "Team features"],
      },
      {
        name: "Enterprise",
        price: "Custom",
        notes: ["Custom pricing", "SSO", "Dedicated support"],
      },
    ],
    porygonPlans: PORYGON_PLANS,
    savingsCallout:
      "Team of 5: $350/mo with Supademo → $50/mo with Porygon — 7x cheaper",
    features: [
      { feature: "Free demos", competitor: "5", porygon: "10" },
      { feature: "Free watermark", competitor: true, porygon: false },
      {
        feature: "Pricing model",
        competitor: "Per creator",
        porygon: "Flat rate",
      },
      { feature: "Branching / Multi-path", competitor: true, porygon: true },
      { feature: "Embed anywhere", competitor: true, porygon: true },
      {
        feature: "Custom branding",
        competitor: "Paid only",
        porygon: "Pro+",
      },
      { feature: "Analytics", competitor: true, porygon: true },
      {
        feature: "GIF / Video export",
        competitor: "Paid only",
        porygon: "Pro+",
      },
      { feature: "Team workspace", competitor: true, porygon: true },
      { feature: "Password protection", competitor: true, porygon: true },
    ],
    verdict: [
      {
        title: "Pricing",
        description:
          "Supademo Growth is $350/mo for 5 creators. Porygon Team is $50/mo for 5 seats — 7x cheaper.",
        winner: "porygon",
      },
      {
        title: "Free tier",
        description:
          "Supademo offers 5 free demos with a watermark. Porygon doubles that to 10 demos with no watermark.",
        winner: "porygon",
      },
      {
        title: "Pricing model",
        description:
          "Supademo charges per creator, so costs grow with your team. Porygon uses flat pricing — add team members without extra fees.",
        winner: "porygon",
      },
      {
        title: "Feature access",
        description:
          "Both platforms offer branching, embeds, analytics, and team features. Core capabilities are comparable across paid tiers.",
        winner: "tie",
      },
    ],
    seo: {
      title: {
        absolute: "Porygon vs Supademo — Compare Interactive Demo Tools",
      },
      description:
        "Compare Porygon and Supademo side by side. See how Porygon delivers interactive demos at 7x lower cost with flat, predictable pricing.",
    },
  },
};
