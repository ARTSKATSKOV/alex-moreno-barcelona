import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/data/site";
import { useLanguage } from "@/hooks/use-language";

export function Faq() {
  const { locale, t } = useLanguage();

  return (
    <section id="faq" className="scroll-mt-16 border-t border-border bg-card/40 py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t.sections.faqEyebrow}
        </p>
        <h2 className="mt-2 text-5xl font-bold md:text-6xl">{t.sections.faqTitle}</h2>

        <Accordion type="single" collapsible className="mt-8 border-t border-border">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-border">
              <AccordionTrigger className="py-5 text-left text-base font-semibold hover:text-primary hover:no-underline cursor-pointer">
                {locale === "es" ? item.questionEs : item.questionEn}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {locale === "es" ? item.answerEs : item.answerEn}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
