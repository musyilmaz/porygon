import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@porygon/ui/components/accordion";

import { FAQ_ITEMS } from "@/components/marketing/pricing/constants";

export function PricingFAQ() {
  return (
    <section className="border-t bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-center text-lg text-muted-foreground">
          Everything you need to know about pricing
        </p>

        <Accordion type="single" collapsible className="mt-12">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
