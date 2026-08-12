// Branded accordion used to render the "Frequently asked questions" block on
// condo (and eventually neighbourhood + blog) detail pages. Pairs with the
// FAQPage JSON-LD emitted in each page's +Head.tsx so Google can render the
// answers as expandable rich results in the SERP.

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FaqAccordionProps {
  items: Array<{ q: string; a: string }>;
  heading?: string;
  eyebrow?: string;
  defaultOpenFirst?: boolean;
}

export function FaqAccordion({
  items,
  heading = "Frequently asked questions",
  eyebrow = "FAQ",
  defaultOpenFirst = true,
}: FaqAccordionProps) {
  if (!items?.length) return null;

  return (
    <section
      id="faq"
      className="max-w-[1100px] mx-auto px-6 lg:px-10 py-16 lg:py-20"
    >
      <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-2">
        {eyebrow}
      </div>
      <h2
        className="font-serif text-3xl lg:text-4xl mb-8"
        style={{ letterSpacing: "-0.01em" }}
      >
        {heading}
      </h2>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpenFirst ? "faq-0" : undefined}
        className="border-t border-border"
      >
        {items.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-b">
            <AccordionTrigger
              className="text-left text-[16px] lg:text-[18px] font-serif py-5"
              data-testid={`faq-question-${i}`}
            >
              {item.q}
            </AccordionTrigger>
            <AccordionContent
              className="pb-5 text-[14.5px] leading-[1.7] text-foreground/85"
              data-testid={`faq-answer-${i}`}
            >
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
