import { Button } from "@porygon/ui/components/button";
import Link from "next/link";

type Tier = {
  name: string;
  price: string;
  per?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  primary?: boolean;
  tag?: string;
};

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    description: "For solo creators and tire-kickers.",
    features: ["3 demos", "Dot-branded viewer", "Basic analytics"],
    cta: "Start free",
    ctaHref: "/signup",
  },
  {
    name: "Team",
    price: "$29",
    per: "/user/mo",
    description: "Everything GTM needs to ship and measure.",
    features: [
      "Unlimited demos",
      "Branching + personalization",
      "Custom domain & theming",
      "Viewer-level analytics",
    ],
    cta: "Start 14-day trial",
    ctaHref: "/signup",
    primary: true,
    tag: "Most popular",
  },
  {
    name: "Scale",
    price: "Custom",
    description: "SSO, audit logs, and a name on speed dial.",
    features: [
      "SSO · SAML · SCIM",
      "Audit log + data residency",
      "Dedicated CSM",
    ],
    cta: "Talk to sales",
    ctaHref: "mailto:sales@usedot.io",
  },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-32 sm:px-12">
      <div className="mb-14 text-center">
        <div className="mono-label mb-4 !text-primary">05 · PRICING</div>
        <h2 className="font-display text-[44px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
          Priced to{" "}
          <em className="font-instrument font-normal italic text-primary">
            actually use
          </em>
          .
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={
              "relative rounded-[16px] border p-8 " +
              (tier.primary
                ? "border-ink-000 bg-ink-000 text-background"
                : "border-border bg-card text-foreground")
            }
          >
            {tier.tag ? (
              <span className="absolute right-5 top-5 rounded-full bg-primary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-primary-foreground">
                {tier.tag}
              </span>
            ) : null}

            <div
              className={
                "mb-5 font-mono text-[11px] uppercase tracking-[0.12em] " +
                (tier.primary ? "text-ink-500" : "text-ink-400")
              }
            >
              {tier.name}
            </div>
            <div className="mb-2 flex items-baseline gap-1">
              <span className="font-display text-[56px] font-medium leading-none tracking-[-0.04em]">
                {tier.price}
              </span>
              {tier.per ? (
                <span
                  className={
                    "text-sm " +
                    (tier.primary ? "text-ink-500" : "text-muted-foreground")
                  }
                >
                  {tier.per}
                </span>
              ) : null}
            </div>
            <div
              className={
                "mb-6 min-h-[40px] text-sm " +
                (tier.primary ? "text-ink-500" : "text-muted-foreground")
              }
            >
              {tier.description}
            </div>

            <Button
              asChild
              variant={tier.primary ? "default" : "outline"}
              className="h-11 w-full"
            >
              <Link href={tier.ctaHref}>{tier.cta}</Link>
            </Button>

            <div
              className={
                "my-7 h-px " +
                (tier.primary ? "bg-white/10" : "bg-border")
              }
            />

            <ul className="grid gap-3">
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className={
                    "flex gap-2.5 text-[13px] " +
                    (tier.primary ? "text-ink-500" : "text-muted-foreground")
                  }
                >
                  <span
                    className={
                      "inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white " +
                      (tier.primary ? "bg-dot-hi" : "bg-primary")
                    }
                  >
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
