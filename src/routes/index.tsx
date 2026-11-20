import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Clock, Backpack, Check, X, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Schedule } from "@/components/site/Schedule";
import { BookingSheet, type BookingSheetMode } from "@/components/site/BookingSheet";
import { MyBookingsSheet } from "@/components/site/MyBookingsSheet";
import { type Session } from "@/data/schedule";
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

const scrollToSchedule = () =>
  document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth" });

const testimonials = [
  {
    q: "Three sessions a week, never longer than an hour. Deadlift up 40 kg since March.",
    n: "Laura, 36",
    r: "Product Manager",
  },
  {
    q: "Every session has a plan. I just show up and do the work.",
    n: "Tom, 41",
    r: "Engineer, relocated from London",
  },
  {
    q: "The 7am beach sessions fit before my first call. Haven't missed a week.",
    n: "Marta, 29",
    r: "Consultant",
  },
  {
    q: "Back pain gone after two months of mobility and strength work.",
    n: "Daniel, 45",
    r: "Lawyer",
  },
];

function Index() {
  const { t } = useLanguage();
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

  const activeSession = sheetState.sessionId
    ? (sessions.find((s) => s.id === sheetState.sessionId) ?? null)
    : null;
  const totalSavedCount = bookings.length + waitlist.length;

  const openBookSheet = (session: Session) =>
    setSheetState({ open: true, mode: "book", sessionId: session.id });
  const openWaitlistSheet = (session: Session) =>
    setSheetState({ open: true, mode: "waitlist", sessionId: session.id });
  const handleCancelBooking = (session: Session) => {
    cancel(session.id);
    toast.info(t.toasts.cancelled(session.name));
  };
  const handleLeaveWaitlist = (session: Session) => {
    leaveWaitlist(session.id);
    toast.info(t.toasts.leftWaitlist(session.name));
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
              onClick={scrollToSchedule}
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
            <Button size="sm" className="font-semibold" onClick={scrollToSchedule}>
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-28 md:pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Strength & Conditioning · Barcelona
          </p>
          <h1 className="mt-4 max-w-3xl text-6xl font-extrabold sm:text-7xl md:text-8xl">
            Get stronger.
            <br />
            Stay consistent.
            <br />
            <span className="text-primary">In under an hour.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
            Structured sessions in the studio or outdoors — parks, beach and city. Built around your
            calendar.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Button
              size="lg"
              className="h-13 px-8 text-base font-semibold"
              onClick={scrollToSchedule}
            >
              Book Your Session
            </Button>
            <button
              onClick={scrollToSchedule}
              className="text-sm font-semibold underline underline-offset-4 hover:text-primary"
            >
              View Schedule
            </button>
          </div>
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
      />

      {/* Trust */}
      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:items-center">
          <img
            src={coach}
            alt="Portrait of coach Alex Moreno"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-sm object-cover"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Your coach
            </p>
            <h2 className="mt-2 text-5xl font-bold md:text-6xl">Alex Moreno</h2>
            <ul className="mt-8 space-y-5">
              {[
                ["10 years coaching", "NSCA-certified. 1,200+ clients trained in Barcelona."],
                [
                  "Programmed, not improvised",
                  "Every session follows a progressive plan you can track.",
                ],
                ["Built for consistency", "Fixed weekly slots. Average client stays 14 months."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-4 border-l-2 border-primary pl-4">
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-muted-foreground">{d}</p>
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
          <h2 className="text-5xl font-bold md:text-6xl">Clients</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {testimonials.map((t) => (
              <blockquote key={t.n} className="rounded-sm border border-border bg-background p-6">
                <p className="text-lg">"{t.q}"</p>
                <footer className="mt-4 text-sm">
                  <span className="font-semibold">{t.n}</span>{" "}
                  <span className="text-muted-foreground">· {t.r}</span>
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
          <h2 className="text-5xl font-bold md:text-6xl">Logistics</h2>
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
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof MapPin;
              return (
                <div key={t as string} className="bg-background p-6">
                  <I className="size-5 text-primary" />
                  <p className="mt-3 font-semibold">{t as string}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
            Pick a slot.
            <br />
            <span className="text-primary">Show up.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-sm text-muted-foreground">
            Studio and outdoor sessions every day of the week.
          </p>
          <Button
            size="lg"
            className="mt-8 h-13 px-10 text-base font-semibold"
            onClick={scrollToSchedule}
          >
            Book Your Session
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © 2026 Alex Moreno · Barcelona, Spain
      </footer>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <Button className="h-12 w-full text-base font-semibold" onClick={scrollToSchedule}>
          Book Your Session
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
        onBrowseSchedule={scrollToSchedule}
      />
    </div>
  );
}
