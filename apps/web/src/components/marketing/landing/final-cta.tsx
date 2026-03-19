import { Button } from "@porygon/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="border-t bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to create your first demo?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free — no credit card, no watermark, no catch.
        </p>
        <div className="mt-8">
          <Button
            size="lg"
            className="bg-violet-600 text-white hover:bg-violet-700"
            asChild
          >
            <Link href="/signup">
              Start Free <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
