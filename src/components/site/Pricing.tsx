import { Check } from "lucide-react";
import { PRICING_TIERS } from "@/data/site";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PricingProps {
  onSelectPlan: () => void;
}

export function Pricing({ onSelectPlan }: PricingProps) {
  const { locale, t } = useLanguage();

  return (
    <section id="pricing" className="scroll-mt-16 border-y border-border bg-card/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t.sections.pricingEyebrow}
            </p>
            <h2 className="mt-2 text-5xl font-bold md:text-6xl">{t.sections.pricingTitle}</h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">{t.sections.pricingNote}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_TIERS.map((tier) => {
            const features = locale === "es" ? tier.featuresEs : tier.featuresEn;
            const badge = locale === "es" ? tier.badgeEs : tier.badgeEn;

            return (
              <div
                key={tier.id}
                className={cn(
                  "flex flex-col rounded-sm border bg-background p-6 transition-colors",
                  tier.featured
                    ? "border-primary shadow-[0_0_0_1px_var(--color-primary)]"
                    : "border-border hover:border-border/80",
                )}
              >
                <div className="min-h-[1.5rem]">
                  {badge && (
                    <span
                      className={cn(
                        "inline-block rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                        tier.featured
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-2xl font-bold">
                  {locale === "es" ? tier.nameEs : tier.nameEn}
                </h3>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-extrabold tabular-nums">
                    {locale === "es" ? `${tier.priceEur} €` : `€${tier.priceEur}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {locale === "es" ? tier.unitEs : tier.unitEn}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {locale === "es" ? tier.taglineEs : tier.taglineEn}
                </p>

                <ul className="mt-5 space-y-2 text-xs">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.featured ? "default" : "secondary"}
                  className="mt-auto h-10 w-full pt-0 font-semibold"
                  style={{ marginTop: "1.5rem" }}
                  onClick={onSelectPlan}
                >
                  {t.nav.bookCta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
