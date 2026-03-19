export type FeatureValue = boolean | string | "coming-soon";

export interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  seats: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export interface FeatureRow {
  name: string;
  free: FeatureValue;
  pro: FeatureValue;
  team: FeatureValue;
  business: FeatureValue;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const PLANS: Plan[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    seats: "1 seat",
    features: ["10 demos", "Shareable links", "Basic analytics", "No watermarks"],
    highlighted: false,
    cta: "Start Free",
  },
  {
    name: "Pro",
    monthlyPrice: 20,
    annualPrice: 200,
    seats: "1 seat",
    features: [
      "Unlimited demos",
      "Custom branding",
      "Embed anywhere",
      "Full analytics",
    ],
    highlighted: true,
    cta: "Start Free",
  },
  {
    name: "Team",
    monthlyPrice: 50,
    annualPrice: 500,
    seats: "5 seats",
    features: [
      "Everything in Pro",
      "Team workspace",
      "Team analytics",
      "Priority support",
    ],
    highlighted: false,
    cta: "Start Free",
  },
  {
    name: "Business",
    monthlyPrice: 99,
    annualPrice: 990,
    seats: "15 seats",
    features: [
      "Everything in Team",
      "SSO (coming soon)",
      "Dedicated support",
      "Custom integrations",
    ],
    highlighted: false,
    cta: "Start Free",
  },
];

export const FEATURE_COMPARISON: FeatureRow[] = [
  { name: "Demos", free: "10", pro: "Unlimited", team: "Unlimited", business: "Unlimited" },
  { name: "Seats", free: "1", pro: "1", team: "5", business: "15" },
  { name: "Shareable links", free: true, pro: true, team: true, business: true },
  { name: "Embed anywhere", free: false, pro: true, team: true, business: true },
  { name: "Custom branding", free: false, pro: true, team: true, business: true },
  { name: "GIF/Video export", free: false, pro: true, team: true, business: true },
  { name: "Password protection", free: false, pro: true, team: true, business: true },
  { name: "Basic analytics", free: true, pro: true, team: true, business: true },
  { name: "Full analytics", free: false, pro: true, team: true, business: true },
  { name: "Team workspace", free: false, pro: false, team: true, business: true },
  { name: "Team analytics", free: false, pro: false, team: true, business: true },
  { name: "Priority support", free: false, pro: false, team: true, business: true },
  { name: "SSO", free: false, pro: false, team: false, business: "coming-soon" },
  { name: "Dedicated support", free: false, pro: false, team: false, business: true },
  { name: "Custom integrations", free: false, pro: false, team: false, business: true },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is there really no per-seat pricing?",
    answer:
      "Correct. Each plan includes a fixed number of seats at a flat rate. No surprises on your invoice when your team grows within your plan's limit.",
  },
  {
    question: "What happens when I hit the demo limit on Free?",
    answer:
      "You can keep viewing and sharing your existing demos. To create new ones, upgrade to Pro for unlimited demos.",
  },
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes. Upgrade or downgrade whenever you need to. When upgrading, you'll be prorated for the remainder of your billing period. When downgrading, the change takes effect at the end of your current period.",
  },
  {
    question: "How does annual billing work?",
    answer:
      "Annual plans are billed once per year at a discounted rate — you get 2 months free compared to monthly billing. You can switch between monthly and annual at any time.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. If you're not satisfied within the first 14 days of a paid plan, contact us for a full refund — no questions asked.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards via Stripe. We'll add more payment methods based on demand.",
  },
];
