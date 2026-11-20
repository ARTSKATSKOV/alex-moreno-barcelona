import { Calendar, ExternalLink, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DAYS, type Session } from "@/data/schedule";
import type { BookingRecord, WaitlistRecord } from "@/hooks/use-bookings";
import { useLanguage } from "@/hooks/use-language";
import { buildGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";

export interface MyBookingsSheetProps {
  open: boolean;
  onClose: () => void;
  sessions: Session[];
  bookings: BookingRecord[];
  waitlist: WaitlistRecord[];
  onCancelBooking: (session: Session) => void;
  onLeaveWaitlist: (session: Session) => void;
  onBrowseSchedule: () => void;
}

export function MyBookingsSheet({
  open,
  onClose,
  sessions,
  bookings,
  waitlist,
  onCancelBooking,
  onLeaveWaitlist,
  onBrowseSchedule,
}: MyBookingsSheetProps) {
  const { t } = useLanguage();

  const bookedItems = bookings
    .map((record) => ({
      record,
      session: sessions.find((s) => s.id === record.sessionId),
    }))
    .filter((item): item is { record: BookingRecord; session: Session } => Boolean(item.session));

  const waitlistItems = waitlist
    .map((record) => ({
      record,
      session: sessions.find((s) => s.id === record.sessionId),
    }))
    .filter((item): item is { record: WaitlistRecord; session: Session } => Boolean(item.session));

  const isEmpty = bookedItems.length === 0 && waitlistItems.length === 0;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-border bg-card sm:max-w-md"
      >
        <SheetHeader className="p-0 pt-2 text-left">
          <SheetTitle className="font-display text-3xl uppercase">{t.myBookings.title}</SheetTitle>
          <SheetDescription>{t.myBookings.subtitle}</SheetDescription>
        </SheetHeader>

        {isEmpty ? (
          <div className="mt-10 rounded-sm border border-dashed border-border bg-background/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">{t.myBookings.empty}</p>
            <Button
              className="mt-4"
              onClick={() => {
                onClose();
                onBrowseSchedule();
              }}
            >
              {t.myBookings.browseSchedule}
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {bookedItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {t.myBookings.bookedSection}
                </p>
                <ul className="mt-3 space-y-3">
                  {bookedItems.map(({ session }) => (
                    <li
                      key={session.id}
                      className="rounded-sm border border-border bg-background/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-2xl font-bold uppercase leading-tight">
                            {session.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {DAYS[session.day]} · {session.time} · {session.duration} min ·{" "}
                            {session.spot}
                          </p>
                        </div>
                      </div>

                      <a
                        href={session.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <MapPin className="size-3.5" />
                        {session.meetingPoint}
                      </a>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            downloadIcsFile(session);
                            toast.success(t.toasts.calendarDownloaded);
                          }}
                        >
                          <Calendar className="size-3.5" />
                          .ics
                        </Button>
                        <Button type="button" size="sm" variant="outline" asChild>
                          <a
                            href={buildGoogleCalendarUrl(session)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="size-3.5" />
                            Google
                          </a>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => onCancelBooking(session)}
                        >
                          <Trash2 className="size-3.5" />
                          {t.myBookings.cancelBtn}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {waitlistItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t.myBookings.waitlistSection}
                </p>
                <ul className="mt-3 space-y-3">
                  {waitlistItems.map(({ session }) => (
                    <li
                      key={session.id}
                      className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background/50 p-4"
                    >
                      <div>
                        <p className="font-display text-xl font-bold uppercase leading-tight">
                          {session.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {DAYS[session.day]} · {session.time} · {session.spot}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onLeaveWaitlist(session)}
                      >
                        {t.myBookings.leaveBtn}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
