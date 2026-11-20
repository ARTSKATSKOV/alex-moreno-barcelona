import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Clock, ExternalLink, MapPin, X } from "lucide-react";
import {
  getUpcomingWeekDates,
  getWeekdayIndex,
  type Focus,
  type Place,
  type Session,
  type WeekDayInfo,
} from "@/data/schedule";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type PlaceFilter = "All" | Place;
type FocusFilter = "All" | Focus;
type ViewMode = "day" | "week";

export interface ScheduleProps {
  sessions: Session[];
  onBook: (session: Session) => void;
  onWaitlist?: (session: Session) => void;
  onCancel?: (session: Session) => void;
  onLeaveWaitlist?: (session: Session) => void;
  isBooked?: (sessionId: string) => boolean;
  isWaitlisted?: (sessionId: string) => boolean;
  locationFilter?: string | null;
  onClearLocationFilter?: () => void;
  /** Optional override for deterministic date rendering in tests. */
  referenceDate?: Date;
}

const PLACE_OPTIONS: PlaceFilter[] = ["All", "Studio", "Outdoor"];
const FOCUS_OPTIONS: FocusFilter[] = ["All", "Strength", "Conditioning", "Mobility"];

export function Schedule({
  sessions,
  onBook,
  onWaitlist,
  onCancel,
  onLeaveWaitlist,
  isBooked,
  isWaitlisted,
  locationFilter = null,
  onClearLocationFilter,
  referenceDate,
}: ScheduleProps) {
  const { locale, t } = useLanguage();
  const [now, setNow] = useState<Date | null>(() => referenceDate ?? null);
  const [selectedDay, setSelectedDay] = useState<string>(() =>
    String(referenceDate ? getWeekdayIndex(referenceDate) : 0),
  );
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>("All");
  const [focusFilter, setFocusFilter] = useState<FocusFilter>("All");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Resolve today's weekday on the client after hydration to avoid SSR timezone mismatches.
  useEffect(() => {
    if (referenceDate) return;
    const current = new Date();
    setNow(current);
    setSelectedDay(String(getWeekdayIndex(current)));
  }, [referenceDate]);

  // When a user clicks a Barcelona location card, switch to Full Week if the current day has no match.
  useEffect(() => {
    if (!locationFilter) return;
    const activeDayNum = Number(selectedDay);
    const hasOnCurrentDay = sessions.some(
      (s) => s.day === activeDayNum && s.spot === locationFilter,
    );
    if (!hasOnCurrentDay) {
      setViewMode("week");
    }
  }, [locationFilter, selectedDay, sessions]);

  const weekDays: WeekDayInfo[] = useMemo(
    () => getUpcomingWeekDates(now ?? new Date(2026, 10, 16)),
    [now],
  );

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (placeFilter !== "All" && s.place !== placeFilter) return false;
      if (focusFilter !== "All" && s.focus !== focusFilter) return false;
      if (locationFilter && s.spot !== locationFilter) return false;
      return true;
    });
  }, [sessions, placeFilter, focusFilter, locationFilter]);

  const hasActiveFilters =
    placeFilter !== "All" || focusFilter !== "All" || Boolean(locationFilter);

  const resetFilters = () => {
    setPlaceFilter("All");
    setFocusFilter("All");
    onClearLocationFilter?.();
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatPrice = (priceEur: number) => (locale === "es" ? `${priceEur} €` : `€${priceEur}`);

  const placeLabel = (opt: PlaceFilter) => {
    if (opt === "All") return t.schedule.all;
    if (opt === "Studio") return t.schedule.studio;
    return t.schedule.outdoor;
  };

  const renderRow = (s: Session) => {
    const booked = isBooked?.(s.id) ?? false;
    const waitlisted = isWaitlisted?.(s.id) ?? false;
    const full = s.spots === 0;
    const low = s.spots > 0 && s.spots <= 3;
    const expanded = Boolean(expandedIds[s.id]);

    return (
      <li key={s.id} className="px-2 py-5 transition-colors hover:bg-accent/30 sm:px-3">
        <div className="grid grid-cols-[4rem_1fr] items-center gap-x-4 gap-y-3 md:grid-cols-[5rem_1fr_9.5rem_9rem]">
          <div className="font-display text-3xl font-bold tabular-nums">{s.time}</div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => toggleExpanded(s.id)}
                className="group inline-flex items-center gap-1.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                  {s.name}
                </h3>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200 group-hover:text-primary",
                    expanded && "rotate-180 text-primary",
                  )}
                />
              </button>
              {booked && (
                <span className="inline-flex items-center gap-1 rounded-sm bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  <Check className="size-3" />
                  {t.schedule.booked}
                </span>
              )}
              {waitlisted && !booked && (
                <span className="inline-flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  <Clock className="size-3" />
                  {t.schedule.onWaitlist}
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="rounded-sm bg-secondary px-2 py-0.5 font-medium">{s.focus}</span>
              <span
                className={cn(
                  "rounded-sm border px-2 py-0.5 font-medium",
                  s.place === "Outdoor"
                    ? "border-primary/50 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                {s.place === "Outdoor" ? t.schedule.outdoor : t.schedule.studio}
              </span>
              <span className="rounded-sm border border-border/70 px-2 py-0.5 text-muted-foreground">
                {s.level}
              </span>
              <span className="px-1 py-0.5 text-muted-foreground">
                {s.duration} min · {s.spot} ·{" "}
                <span className="font-semibold text-foreground">{formatPrice(s.priceEur)}</span>
              </span>
            </div>
          </div>

          <div
            className={cn(
              "col-start-2 text-sm font-semibold md:col-start-auto",
              full ? "text-muted-foreground" : low ? "text-primary" : "text-foreground",
            )}
          >
            {full ? t.schedule.full : t.schedule.spotsOf(s.spots, s.capacity)}
          </div>

          <div className="col-start-2 flex items-center gap-2 md:col-start-auto md:justify-end">
            {booked ? (
              <Button
                variant="outline"
                className="h-11 w-full font-semibold md:w-auto"
                onClick={() => onCancel?.(s)}
              >
                {t.schedule.cancel}
              </Button>
            ) : waitlisted ? (
              <Button
                variant="outline"
                className="h-11 w-full font-semibold md:w-auto"
                onClick={() => onLeaveWaitlist?.(s)}
              >
                {t.schedule.leaveWaitlist}
              </Button>
            ) : full ? (
              <Button
                variant="secondary"
                className="h-11 w-full font-semibold md:w-auto"
                onClick={() => (onWaitlist ?? onBook)(s)}
              >
                {t.schedule.joinWaitlist}
              </Button>
            ) : (
              <Button
                className="h-11 w-full font-semibold md:w-auto md:min-w-[6.5rem]"
                onClick={() => onBook(s)}
              >
                {t.schedule.book}
              </Button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 ml-0 rounded-sm border border-border/70 bg-background/80 p-4 text-sm md:ml-24">
            <p className="text-foreground/90">{s.description}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.schedule.meetingPoint}
                </p>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-foreground/90">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>{s.meetingPoint}</span>
                </p>
                <a
                  href={s.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {t.schedule.openMaps}
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.schedule.equipment}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {s.equipment.map((item) => (
                    <span
                      key={item}
                      className="rounded-sm bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </li>
    );
  };

  const renderEmpty = () => (
    <div className="mt-4 flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-background/40 px-4 py-12 text-center">
      <p className="text-sm text-muted-foreground">{t.schedule.emptyTitle}</p>
      {hasActiveFilters && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={resetFilters}>
          {t.schedule.resetFilters}
        </Button>
      )}
    </div>
  );

  return (
    <section
      id="schedule"
      className="scroll-mt-16 border-y border-border bg-card/40 py-16 md:py-24"
    >
      <div className="mx-auto max-w-5xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t.schedule.eyebrow}
            </p>
            <h2 className="mt-2 text-5xl font-bold md:text-6xl">{t.schedule.title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">{t.schedule.subtitle}</p>
            <div
              role="group"
              aria-label="Schedule view"
              className="inline-flex rounded-sm border border-border bg-background p-0.5 text-xs font-semibold"
            >
              <button
                type="button"
                aria-pressed={viewMode === "day"}
                onClick={() => setViewMode("day")}
                className={cn(
                  "rounded-sm px-2.5 py-1.5 transition-colors cursor-pointer",
                  viewMode === "day"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.schedule.viewByDay}
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "week"}
                onClick={() => setViewMode("week")}
                className={cn(
                  "rounded-sm px-2.5 py-1.5 transition-colors cursor-pointer",
                  viewMode === "week"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.schedule.viewFullWeek}
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 rounded-sm border border-border bg-background/60 p-1">
            {PLACE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                aria-pressed={placeFilter === opt}
                onClick={() => setPlaceFilter(opt)}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                  placeFilter === opt
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {placeLabel(opt)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-sm border border-border bg-background/60 p-1">
            {FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                aria-pressed={focusFilter === opt}
                onClick={() => setFocusFilter(opt)}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                  focusFilter === opt
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt === "All" ? t.schedule.all : opt}
              </button>
            ))}
          </div>

          {locationFilter && (
            <button
              type="button"
              onClick={() => onClearLocationFilter?.()}
              className="inline-flex items-center gap-1.5 rounded-sm border border-primary/60 bg-primary/15 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25 cursor-pointer"
            >
              <MapPin className="size-3" />
              {locationFilter}
              <X className="size-3" aria-label={t.schedule.clearLocation} />
            </button>
          )}
        </div>

        {viewMode === "day" ? (
          <Tabs value={selectedDay} onValueChange={setSelectedDay} className="mt-6">
            <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-sm border border-border bg-background/50 p-1 sm:grid sm:grid-cols-7">
              {weekDays.map((d) => {
                const count = filteredSessions.filter((s) => s.day === d.day).length;
                return (
                  <TabsTrigger
                    key={d.label}
                    value={String(d.day)}
                    className={cn(
                      "group flex min-h-[3.75rem] min-w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-sm py-2 text-center text-sm font-semibold transition-colors sm:min-w-0",
                      "data-[state=active]:bg-foreground data-[state=active]:text-background",
                      "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-1">
                      <span>{d.label}</span>
                      {now && <span className="text-xs opacity-80">{d.dayOfMonth}</span>}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[10px] font-normal opacity-80">
                      {now && d.isToday ? (
                        <span className="font-semibold text-primary group-data-[state=active]:text-background">
                          {t.schedule.today}
                        </span>
                      ) : (
                        <span>
                          {count} {t.schedule.classesShort}
                        </span>
                      )}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {weekDays.map((d) => {
              const dayList = filteredSessions.filter((s) => s.day === d.day);
              return (
                <TabsContent key={d.label} value={String(d.day)} className="mt-4">
                  {dayList.length === 0 ? (
                    renderEmpty()
                  ) : (
                    <ul className="divide-y divide-border border-y border-border">
                      {dayList.map(renderRow)}
                    </ul>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <div className="mt-6 space-y-6">
            {filteredSessions.length === 0
              ? renderEmpty()
              : weekDays.map((d) => {
                  const dayList = filteredSessions.filter((s) => s.day === d.day);
                  if (dayList.length === 0) return null;
                  return (
                    <div key={d.label}>
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-2xl font-bold">
                          {d.label} {now ? d.dayOfMonth : ""}
                        </h3>
                        {now && d.isToday && (
                          <span className="rounded-sm bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                            {t.schedule.today}
                          </span>
                        )}
                      </div>
                      <ul className="divide-y divide-border border-y border-border">
                        {dayList.map(renderRow)}
                      </ul>
                    </div>
                  );
                })}
          </div>
        )}
      </div>
    </section>
  );
}
