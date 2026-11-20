import { ArrowRight, Check } from "lucide-react";
import { TRAINING_FORMATS } from "@/data/site";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

export interface FormatsProps {
  onPickSlot: () => void;
  onInquirePrivate: () => void;
}

export function Formats({ onPickSlot, onInquirePrivate }: FormatsProps) {
  const { locale, t } = useLanguage();

  return (
    <section id="formats" className="scroll-mt-16 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t.sections.formatsEyebrow}
        </p>
        <h2 className="mt-2 text-5xl font-bold md:text-6xl">{t.sections.formatsTitle}</h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {TRAINING_FORMATS.map((fmt) => {
            const isPrivate = fmt.id === "private-1on1";
            const highlights = locale === "es" ? fmt.highlightsEs : fmt.highlightsEn;

            return (
              <div
                key={fmt.id}
                className="flex flex-col rounded-sm border border-border bg-card/60 p-6 transition-colors hover:border-primary/50 md:p-8"
              >
                <span className="w-fit rounded-sm border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  {locale === "es" ? fmt.badgeEs : fmt.badgeEn}
                </span>
                <h3 className="mt-4 text-3xl font-bold md:text-4xl">
                  {locale === "es" ? fmt.titleEs : fmt.titleEn}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {locale === "es" ? fmt.summaryEs : fmt.summaryEn}
                </p>

                <ul className="mt-6 space-y-2.5 text-sm">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-2">
                  <Button
                    variant={isPrivate ? "outline" : "default"}
                    size="lg"
                    className="h-11 font-semibold"
                    onClick={isPrivate ? onInquirePrivate : onPickSlot}
                  >
                    {locale === "es" ? fmt.ctaEs : fmt.ctaEn}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
