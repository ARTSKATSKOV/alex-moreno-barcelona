import { Instagram, Mail, MessageCircle } from "lucide-react";
import { CONTACT } from "@/data/site";
import { useLanguage } from "@/hooks/use-language";

export function Footer() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-wide">
            {CONTACT.brand}
            <span className="text-primary">.</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {CONTACT.city} · {locale === "es" ? CONTACT.studioHoursEs : CONTACT.studioHoursEn}
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-start gap-x-5 gap-y-2 text-sm text-muted-foreground"
        >
          <a href="#schedule" className="hover:text-foreground">
            {t.nav.schedule}
          </a>
          <a href="#locations" className="hover:text-foreground">
            {t.nav.locations}
          </a>
          <a href="#pricing" className="hover:text-foreground">
            {t.nav.pricing}
          </a>
          <a href="#coach" className="hover:text-foreground">
            {t.nav.coach}
          </a>
          <a href="#faq" className="hover:text-foreground">
            {t.nav.faq}
          </a>
        </nav>

        <div className="flex flex-col items-start gap-2.5 md:items-end">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <a
              href={CONTACT.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-primary/50 bg-primary/10 px-3 py-1.5 text-primary transition-colors hover:bg-primary/20"
            >
              <MessageCircle className="size-3.5" />
              WhatsApp
            </a>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="size-3.5" />
              {CONTACT.instagramHandle}
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="size-3.5" />
              Email
            </a>
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              © 2026 {CONTACT.brand} · {CONTACT.city}
            </span>
            <div
              role="group"
              aria-label="Language"
              className="inline-flex rounded-sm border border-border p-0.5 text-[11px] font-semibold"
            >
              <button
                type="button"
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
                className={
                  locale === "en"
                    ? "rounded-sm bg-foreground px-1.5 py-0.5 text-background cursor-pointer"
                    : "px-1.5 py-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                }
              >
                EN
              </button>
              <button
                type="button"
                aria-pressed={locale === "es"}
                onClick={() => setLocale("es")}
                className={
                  locale === "es"
                    ? "rounded-sm bg-foreground px-1.5 py-0.5 text-background cursor-pointer"
                    : "px-1.5 py-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                }
              >
                ES
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
