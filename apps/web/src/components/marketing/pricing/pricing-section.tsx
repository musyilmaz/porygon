"use client";

import { Badge } from "@porygon/ui/components/badge";
import { Button } from "@porygon/ui/components/button";
import { Separator } from "@porygon/ui/components/separator";
import { cn } from "@porygon/ui/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PLANS } from "@/components/marketing/pricing/constants";

type BillingPeriod = "monthly" | "annual";

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  return (
    <section className="pb-20 lg:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center rounded-full border bg-muted/50 p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                billingPeriod === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                billingPeriod === "annual"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
            </button>
          </div>
          {billingPeriod === "annual" && (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Save 17%
            </Badge>
          )}
          {billingPeriod === "monthly" && (
            <Badge
              variant="secondary"
              className="cursor-pointer text-muted-foreground"
              onClick={() => setBillingPeriod("annual")}
            >
              Save 17%
            </Badge>
          )}
        </div>

        {/* Plan cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const price =
              billingPeriod === "monthly"
                ? plan.monthlyPrice
                : plan.annualPrice;
            const period = billingPeriod === "monthly" ? "/mo" : "/yr";

            return (
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
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">{period}</span>
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
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Team of 5 on Arcade: $350+/mo. On Porygon:{" "}
          <span className="font-semibold text-foreground">$50/mo</span>.
        </p>
      </div>
    </section>
  );
}
