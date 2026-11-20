import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Backpack, CalendarCheck, Check, Clock, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Schedule } from "@/components/site/Schedule";
import { BookingSheet, type BookingSheetMode } from "@/components/site/BookingSheet";
import { MyBookingsSheet } from "@/components/site/MyBookingsSheet";
import { Formats } from "@/components/site/Formats";
import { Pricing } from "@/components/site/Pricing";
import { Locations } from "@/components/site/Locations";
import { Faq } from "@/components/site/Faq";
import { Footer } from "@/components/site/Footer";
import {
  DAYS,
  getNextAvailableSession,
  type NextSessionMatch,
  type Session,
} from "@/data/schedule";
import { PROOF_STATS, TESTIMONIALS } from "@/data/site";
import { useBookings } from "@/hooks/use-bookings";
import { useLanguage } from "@/hooks/use-language";
import hero from "@/assets/hero.jpg";
import coach from "@/assets/coach.jpg";
import studio from "@/assets/studio.jpg";
import park from "@/assets/park.jpg";
import urban from "@/assets/urban.jpg";
import studioSession from "@/assets/studio-session.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alex Moreno — Book Strength Sessions in Barcelona" },
      {
        name: "description",
        content:
          "Structured strength and conditioning sessions in a Barcelona studio and outdoors. See the schedule and book in one click.",
      },
      { property: "og:title", content: "Alex Moreno — Book Strength Sessions in Barcelona" },
      {
        property: "og:description",
        content:
          "Studio and outdoor training in Barcelona. See live availability and book your session.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function Index() {
  const { locale, t } = useLanguage();
  const {
    sessions,
    bookings,
    waitlist,
    isBooked,
    isWaitlisted,
    book,
    cancel,
    joinWaitlist,
    leaveWaitlist,
  } = useBookings();

  const [sheetState, setSheetState] = useState<{
    open: boolean;
    mode: BookingSheetMode;
    sessionId: string | null;
  }>({ open: false, mode: "book", sessionId: null });
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<NextSessionMatch | null>(null);

  useEffect(() => {
    setNextAvailable(getNextAvailableSession(sessions, new Date()));
  }, [sessions]);

  const activeSession = sheetState.sessionId
    ? (sessions.find((s) => s.id === sheetState.sessionId) ?? null)
    : null;
  const totalSavedCount = bookings.length + waitlist.length;

  const openBookSheet = (session: Session) =>
    setSheetState({ open: true, mode: "book", sessionId: session.id });
  const openWaitlistSheet = (session: Session) =>
    setSheetState({ open: true, mode: "waitlist", sessionId: session.id });
  const openInquirySheet = () => setSheetState({ open: true, mode: "inquiry", sessionId: null });

  const handleCancelBooking = (session: Session) => {
    cancel(session.id);
    toast.info(t.toasts.cancelled(session.name));
  };
  const handleLeaveWaitlist = (session: Session) => {
    leaveWaitlist(session.id);
    toast.info(t.toasts.leftWaitlist(session.name));
  };
  const handleSelectLocation = (spot: string) => {
    setLocationFilter(spot);
    scrollToId("schedule");
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <span className="font-display text-xl font-bold uppercase tracking-wide">
            Alex Moreno<span className="text-primary">.</span>
          </span>
          <nav className="flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => scrollToId("schedule")}
              className="hidden text-muted-foreground hover:text-foreground sm:block cursor-pointer"
            >
              {t.nav.schedule}
            </button>
            <button
              type="button"
              onClick={() => setMyBookingsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent cursor-pointer"
            >
              <CalendarCheck className="size-3.5 text-primary" />
              <span className="hidden sm:inline">{t.nav.myBookings}</span>
              {totalSavedCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground">
                  {totalSavedCount}
                </span>
              )}
            </button>
            <Button size="sm" className="font-semibold" onClick={() => scrollToId("schedule")}>
              {t.nav.bookCta}
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        <img
          src={hero}
          alt="Coach Alex Moreno training a client on Barceloneta beach at sunrise"
          className="absolute inset-0 size-full object-cover object-[60%_center]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/35 to-transparent" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-between gap-8 px-5 pb-14 pt-28 md:flex-row md:items-end md:pb-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t.hero.eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-6xl font-extrabold sm:text-7xl md:text-8xl">
              {t.hero.headlineLine1}
              <br />
              {t.hero.headlineLine2}
              <br />
              <span className="text-primary">{t.hero.headlineAccent}</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-foreground/85 md:text-lg">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Button
                size="lg"
                className="h-13 px-8 text-base font-semibold"
                onClick={() => scrollToId("schedule")}
              >
                {t.hero.primaryCta}
              </Button>
              <button
                type="button"
                onClick={() => scrollToId("pricing")}
                className="text-sm font-semibold underline underline-offset-4 hover:text-primary cursor-pointer"
              >
                {t.hero.secondaryCta}
              </button>
            </div>
          </div>

          {nextAvailable && (
            <button
              type="button"
              onClick={() => openBookSheet(nextAvailable.session)}
              className="group w-full max-w-xs rounded-sm border border-border/90 bg-background/85 p-4 text-left backdrop-blur transition-colors hover:border-primary cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <span>{t.hero.nextAvailableLabel}</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold uppercase leading-tight">
                {nextAvailable.session.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {nextAvailable.isToday ? t.hero.today : DAYS[nextAvailable.session.day]} ·{" "}
                {nextAvailable.session.time} · {nextAvailable.session.spot}
              </p>
              <p className="mt-2 text-xs font-semibold text-foreground">
                {t.hero.spotsLeft(nextAvailable.session.spots)}
              </p>
            </button>
          )}
        </div>
      </section>

      {/* Proof Metric Strip */}
      <section aria-label="Coaching metrics" className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          {PROOF_STATS.map((stat) => (
            <div key={stat.id} className="px-5 py-7 text-center sm:text-left">
              <p className="font-display text-4xl font-extrabold tabular-nums text-primary md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {locale === "es" ? stat.labelEs : stat.labelEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Schedule
        sessions={sessions}
        onBook={openBookSheet}
        onWaitlist={openWaitlistSheet}
        onCancel={handleCancelBooking}
        onLeaveWaitlist={handleLeaveWaitlist}
        isBooked={isBooked}
        isWaitlisted={isWaitlisted}
        locationFilter={locationFilter}
        onClearLocationFilter={() => setLocationFilter(null)}
      />

      <Formats onPickSlot={() => scrollToId("schedule")} onInquirePrivate={openInquirySheet} />

      <Pricing onSelectPlan={() => scrollToId("schedule")} />

      <Locations
        sessions={sessions}
        activeLocation={locationFilter}
        onSelectLocation={handleSelectLocation}
      />

      {/* Trust / Coach */}
      <section id="coach" className="scroll-mt-16 border-t border-border py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:items-center">
          <img
            src={coach}
            alt="Portrait of coach Alex Moreno"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-sm object-cover"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t.sections.coachEyebrow}
            </p>
            <h2 className="mt-2 text-5xl font-bold md:text-6xl">Alex Moreno</h2>
            <ul className="mt-8 space-y-5">
              {[
                [
                  locale === "es" ? "10 años entrenando" : "10 years coaching",
                  locale === "es"
                    ? "Certificación NSCA. Más de 1.200 clientes entrenados en Barcelona."
                    : "NSCA-certified. 1,200+ clients trained in Barcelona.",
                ],
                [
                  locale === "es" ? "Programado, no improvisado" : "Programmed, not improvised",
                  locale === "es"
                    ? "Cada sesión sigue un plan progresivo que puedes medir."
                    : "Every session follows a progressive plan you can track.",
                ],
                [
                  locale === "es" ? "Pensado para ser constante" : "Built for consistency",
                  locale === "es"
                    ? "Horarios semanales fijos. Permanencia media de 14 meses."
                    : "Fixed weekly slots. Average client stays 14 months.",
                ],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-4 border-l-2 border-primary pl-4">
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <figure>
                <img
                  src={studio}
                  alt="Eixample training studio"
                  loading="lazy"
                  className="aspect-square w-full rounded-sm object-cover"
                />
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  Studio · Eixample
                </figcaption>
              </figure>
              <figure>
                <img
                  src={park}
                  alt="Outdoor group session in Parc de la Ciutadella"
                  loading="lazy"
                  className="aspect-square w-full rounded-sm object-cover"
                />
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  Outdoor · Ciutadella
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-border bg-card/40 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-5xl font-bold md:text-6xl">{t.sections.clientsTitle}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {TESTIMONIALS.map((item) => (
              <blockquote
                key={item.id}
                className="rounded-sm border border-border bg-background p-6"
              >
                <p className="text-lg">
                  &ldquo;{locale === "es" ? item.quoteEs : item.quoteEn}&rdquo;
                </p>
                <footer className="mt-4 text-sm">
                  <span className="font-semibold">{item.name}</span>{" "}
                  <span className="text-muted-foreground">
                    · {locale === "es" ? item.roleEs : item.roleEn}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            <img
              src={studioSession}
              alt="Client deadlifting with coaching in the studio"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-sm object-cover"
            />
            <img
              src={urban}
              alt="Client doing step-ups in Poblenou"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-sm object-cover"
            />
            <img
              src={park}
              alt="Group training in the park"
              loading="lazy"
              className="col-span-2 aspect-[2/1] w-full rounded-sm object-cover md:col-span-1 md:aspect-[4/5]"
            />
          </div>
        </div>
      </section>

      {/* Logistics */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-5xl font-bold md:text-6xl">{t.sections.logisticsTitle}</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              [MapPin, "Base", "Studio in Eixample, Barcelona, Spain."],
              [
                MapPin,
                "Outdoor locations",
                "Parc de la Ciutadella, Barceloneta Beach, Montjuïc, Poblenou.",
              ],
              [Clock, "Session length", "45–60 minutes. Start on time, finish on time."],
              [
                Backpack,
                "What to bring",
                "Trainers, water, towel. Outdoor: a light layer. Equipment provided.",
              ],
              [
                Check,
                "For",
                "Professionals and expats who want structure, strength and a fixed routine. All levels.",
              ],
              [
                X,
                "Not for",
                "Quick-fix diets, extreme cutting, or anyone looking for entertainment over training.",
              ],
            ].map(([Icon, title, desc]) => {
              const I = Icon as typeof MapPin;
              return (
                <div key={title as string} className="bg-background p-6">
                  <I className="size-5 text-primary" />
                  <p className="mt-3 font-semibold">{title as string}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{desc as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Faq />

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <img
          src={urban}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 text-center md:py-32">
          <h2 className="text-6xl font-extrabold md:text-8xl">
            {t.sections.finalHeadline1}
            <br />
            <span className="text-primary">{t.sections.finalHeadline2}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-sm text-muted-foreground">{t.sections.finalSubtitle}</p>
          <Button
            size="lg"
            className="mt-8 h-13 px-10 text-base font-semibold"
            onClick={() => scrollToId("schedule")}
          >
            {t.nav.bookCta}
          </Button>
        </div>
      </section>

      <Footer />

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <Button
          className="h-12 w-full text-base font-semibold"
          onClick={() => scrollToId("schedule")}
        >
          {t.nav.bookCta}
        </Button>
      </div>

      <BookingSheet
        open={sheetState.open}
        mode={sheetState.mode}
        session={activeSession}
        alreadyBooked={activeSession ? isBooked(activeSession.id) : false}
        onClose={() => setSheetState((prev) => ({ ...prev, open: false }))}
        onConfirmBook={book}
        onConfirmWaitlist={joinWaitlist}
      />

      <MyBookingsSheet
        open={myBookingsOpen}
        onClose={() => setMyBookingsOpen(false)}
        sessions={sessions}
        bookings={bookings}
        waitlist={waitlist}
        onCancelBooking={handleCancelBooking}
        onLeaveWaitlist={handleLeaveWaitlist}
        onBrowseSchedule={() => scrollToId("schedule")}
      />
    </div>
  );
}
