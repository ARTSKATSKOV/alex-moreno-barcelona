import { ArrowUpRight, ExternalLink, MapPin, Train } from "lucide-react";
import type { Session } from "@/data/schedule";
import { TRAINING_LOCATIONS } from "@/data/site";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LocationsProps {
  sessions: Session[];
  activeLocation: string | null;
  onSelectLocation: (spot: string) => void;
}

export function Locations({ sessions, activeLocation, onSelectLocation }: LocationsProps) {
  const { locale, t } = useLanguage();

  return (
    <section id="locations" className="scroll-mt-16 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t.sections.locationsEyebrow}
        </p>
        <h2 className="mt-2 text-5xl font-bold md:text-6xl">{t.sections.locationsTitle}</h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRAINING_LOCATIONS.map((loc) => {
            const count = sessions.filter((s) => s.spot === loc.spot).length;
            const isSelected = activeLocation === loc.spot;

            return (
              <div
                key={loc.id}
                className={cn(
                  "flex flex-col rounded-sm border bg-card/50 p-6 transition-colors",
                  isSelected ? "border-primary bg-card" : "border-border hover:border-primary/40",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                      loc.place === "Outdoor"
                        ? "border-primary/50 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {loc.place === "Outdoor" ? t.schedule.outdoor : t.schedule.studio}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {count}{" "}
                    {locale === "es"
                      ? count === 1
                        ? "sesión / sem"
                        : "sesiones / sem"
                      : count === 1
                        ? "session / wk"
                        : "sessions / wk"}
                  </span>
                </div>

                <h3 className="mt-3 text-2xl font-bold">{loc.spot}</h3>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{loc.neighborhood}</p>

                <p className="mt-3 flex items-start gap-1.5 text-sm text-foreground/85">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{locale === "es" ? loc.landmarkEs : loc.landmarkEn}</span>
                </p>

                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Train className="size-3.5 shrink-0" />
                  <span>{loc.metro}</span>
                </p>

                <div className="mt-6 flex items-center justify-between gap-2 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "secondary"}
                    className="font-semibold"
                    onClick={() => onSelectLocation(loc.spot)}
                  >
                    {t.sections.seeSessionsHere}
                    <ArrowUpRight className="size-3.5" />
                  </Button>
                  <a
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
                  >
                    Maps
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
