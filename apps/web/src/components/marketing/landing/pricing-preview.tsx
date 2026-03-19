import { Badge } from "@porygon/ui/components/badge";
import { Button } from "@porygon/ui/components/button";
import { Separator } from "@porygon/ui/components/separator";
import { cn } from "@porygon/ui/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    seats: "1 seat",
    features: ["10 demos", "Shareable links", "Basic analytics", "No watermarks"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "/mo",
    seats: "1 seat",
    features: [
      "Unlimited demos",
      "Custom branding",
      "Embed anywhere",
      "Full analytics",
    ],
    highlighted: true,
  },
  {
    name: "Team",
    price: "$50",
    period: "/mo",
    seats: "5 seats",
    features: [
      "Everything in Pro",
      "Team workspace",
      "Team analytics",
      "Priority support",
    ],
    highlighted: false,
  },
  {
    name: "Business",
    price: "$99",
    period: "/mo",
    seats: "15 seats",
    features: [
      "Everything in Team",
      "SSO (coming soon)",
      "Dedicated support",
      "Custom integrations",
    ],
    highlighted: false,
  },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, flat pricing
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            No per-seat fees. No surprises.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-xl border bg-background p-6",
                plan.highlighted &&
                  "border-violet-400 shadow-lg ring-1 ring-violet-400"
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white">
                  Popular
                </Badge>
              )}

              <div>
                <Badge variant="secondary" className="text-xs">
                  Early Access
                </Badge>
                <h3 className="mt-3 text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.seats}
                </p>
              </div>

              <Separator className="my-6" />

              <ul className="flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-violet-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "mt-6 w-full",
                  plan.highlighted &&
                    "bg-violet-600 text-white hover:bg-violet-700"
                )}
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href="/signup">Start Free</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Team of 5 on Arcade: $350+/mo. On Porygon:{" "}
          <span className="font-semibold text-foreground">$50/mo</span>.
        </p>
      </div>
    </section>
  );
}
