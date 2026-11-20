import { useEffect, useState } from "react";
import { CalendarCheck, Menu } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["schedule", "pricing", "locations", "coach", "faq"] as const;
type SectionId = (typeof SECTION_IDS)[number];

export interface HeaderProps {
  savedCount: number;
  onOpenMyBookings: () => void;
  onNavigate: (id: string) => void;
}

export function Header({ savedCount, onOpenMyBookings, onNavigate }: HeaderProps) {
  const { locale, setLocale, t } = useLanguage();
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll-spy active section highlighting via IntersectionObserver.
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target.id) {
          setActiveSection(top.target.id as SectionId);
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const navLinks: { id: SectionId; label: string }[] = [
    { id: "schedule", label: t.nav.schedule },
    { id: "pricing", label: t.nav.pricing },
    { id: "locations", label: t.nav.locations },
    { id: "coach", label: t.nav.coach },
    { id: "faq", label: t.nav.faq },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
        <a
          href="#top"
          className="font-display text-xl font-bold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Alex Moreno<span className="text-primary">.</span>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 text-sm md:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleLinkClick(link.id)}
              aria-current={activeSection === link.id ? "location" : undefined}
              className={cn(
                "relative py-1 font-medium transition-colors cursor-pointer",
                activeSection === link.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
              {activeSection === link.id && (
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Language"
            className="hidden rounded-sm border border-border p-0.5 text-[11px] font-semibold sm:inline-flex"
          >
            <button
              type="button"
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
              className={cn(
                "rounded-sm px-1.5 py-0.5 transition-colors cursor-pointer",
                locale === "en"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              EN
            </button>
            <button
              type="button"
              aria-pressed={locale === "es"}
              onClick={() => setLocale("es")}
              className={cn(
                "rounded-sm px-1.5 py-0.5 transition-colors cursor-pointer",
                locale === "es"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              ES
            </button>
          </div>

          <button
            type="button"
            aria-label={t.nav.myBookings}
            onClick={onOpenMyBookings}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <CalendarCheck className="size-3.5 text-primary" />
            <span className="hidden lg:inline">{t.nav.myBookings}</span>
            {savedCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground">
                {savedCount}
              </span>
            )}
          </button>

          <Button
            size="sm"
            className="hidden font-semibold sm:inline-flex"
            onClick={() => handleLinkClick("schedule")}
          >
            {t.nav.bookCta}
          </Button>

          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:bg-accent md:hidden cursor-pointer"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-72 border-border bg-card">
          <SheetHeader className="p-0 pt-2 text-left">
            <SheetTitle className="font-display text-2xl uppercase">
              Alex Moreno<span className="text-primary">.</span>
            </SheetTitle>
            <SheetDescription>Barcelona · Strength &amp; Conditioning</SheetDescription>
          </SheetHeader>

          <nav aria-label="Mobile navigation" className="mt-8 flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link.id)}
                className={cn(
                  "rounded-sm px-3 py-2.5 text-left text-base font-semibold transition-colors cursor-pointer",
                  activeSection === link.id
                    ? "bg-primary/15 text-primary"
                    : "text-foreground hover:bg-accent",
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {locale === "es" ? "Idioma" : "Language"}
            </span>
            <div
              role="group"
              aria-label="Mobile language"
              className="inline-flex rounded-sm border border-border p-0.5 text-xs font-semibold"
            >
              <button
                type="button"
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
                className={cn(
                  "rounded-sm px-2.5 py-1 cursor-pointer",
                  locale === "en" ? "bg-foreground text-background" : "text-muted-foreground",
                )}
              >
                EN
              </button>
              <button
                type="button"
                aria-pressed={locale === "es"}
                onClick={() => setLocale("es")}
                className={cn(
                  "rounded-sm px-2.5 py-1 cursor-pointer",
                  locale === "es" ? "bg-foreground text-background" : "text-muted-foreground",
                )}
              >
                ES
              </button>
            </div>
          </div>

          <Button
            className="mt-6 h-11 w-full font-semibold"
            onClick={() => handleLinkClick("schedule")}
          >
            {t.nav.bookCta}
          </Button>
        </SheetContent>
      </Sheet>
    </header>
  );
}
