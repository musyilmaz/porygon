import { Button } from "@porygon/ui/components/button";
import { cn } from "@porygon/ui/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    seats: "1 seat",
    features: ["10 demos", "Share links", "Basic analytics", "No watermarks"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$20",
    seats: "1 seat",
    features: ["Unlimited demos", "Custom branding", "Embed anywhere", "Full analytics"],
    highlighted: true,
  },
  {
    name: "Team",
    price: "$50",
    seats: "5 seats",
    features: ["Everything in Pro", "Team workspace", "Team analytics", "Priority support"],
    highlighted: false,
  },
  {
    name: "Business",
    price: "$99",
    seats: "15 seats",
    features: ["Everything in Team", "SSO (coming soon)", "Dedicated support", "Custom integrations"],
    highlighted: false,
  },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="border-t py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing
          </h2>
          <p className="mt-3 text-muted-foreground">
            One price per plan, not per person. Annual billing saves 2 months.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-xl border p-5",
                plan.highlighted
                  ? "border-violet-500 shadow-md ring-1 ring-violet-500"
                  : "bg-background"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-medium text-white">
                  Popular
                </span>
              )}
              <div className="text-sm font-medium text-muted-foreground">
                {plan.name}
              </div>
              <div className="mt-2 flex items-baseline gap-0.5">
                <span className="text-3xl font-bold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <div className="text-xs text-muted-foreground">{plan.seats}</div>

              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-violet-600" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "mt-5 w-full",
                  plan.highlighted && "bg-violet-600 text-white hover:bg-violet-700"
                )}
                variant={plan.highlighted ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href="/signup">Start Free</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
