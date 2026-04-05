"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@porygon/ui/components/accordion";

const faqs = [
  {
    q: "Is the free plan actually free?",
    a: "Yes. 10 demos, shareable links, analytics, no watermarks. No credit card required, no trial period — free forever.",
  },
  {
    q: 'What does "flat pricing" mean?',
    a: "You pay one price per plan, not per user. Team plan is $50/mo for 5 seats total — not $50 per person. The same setup on Arcade would cost $212+/mo.",
  },
  {
    q: "Is there really no watermark?",
    a: 'No watermarks, no "Made with..." badges on any plan — including Free. Your demos look like you built them in-house.',
  },
  {
    q: "How does the Chrome extension work?",
    a: "Install it, click record, browse your product. Every click creates a step with a screenshot. Stop recording and your demo is ready to edit — no uploads needed.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t py-24 lg:py-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          FAQ
        </h2>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-[15px] font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
