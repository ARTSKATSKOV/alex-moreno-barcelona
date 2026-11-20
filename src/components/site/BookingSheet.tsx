import { useEffect, useState, type FormEvent } from "react";
import { Calendar, Check, Clock, ExternalLink, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DAYS, type Session } from "@/data/schedule";
import type { AttendeeDetails } from "@/hooks/use-bookings";
import { useLanguage } from "@/hooks/use-language";
import { buildGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";

export type BookingSheetMode = "book" | "waitlist" | "inquiry";

export interface BookingSheetProps {
  open: boolean;
  mode: BookingSheetMode;
  session: Session | null;
  alreadyBooked?: boolean;
  onClose: () => void;
  onConfirmBook: (
    sessionId: string,
    details: AttendeeDetails,
  ) => { ok: true } | { ok: false; reason: string };
  onConfirmWaitlist: (
    sessionId: string,
    details: Pick<AttendeeDetails, "name" | "email" | "phone">,
  ) => { ok: true } | { ok: false; reason: string };
  onConfirmInquiry?: (details: AttendeeDetails) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingSheet({
  open,
  mode,
  session,
  alreadyBooked = false,
  onClose,
  onConfirmBook,
  onConfirmWaitlist,
  onConfirmInquiry,
}: BookingSheetProps) {
  const { locale, t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<{
    mode: BookingSheetMode;
    session: Session | null;
    email: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setCompleted(null);
      setError(null);
    }
  }, [open, session?.id, mode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedNotes = notes.trim();

    if (trimmedName.length < 2) {
      setError(
        locale === "es" ? "Por favor, introduce tu nombre completo." : "Please enter your name.",
      );
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError(
        locale === "es"
          ? "Por favor, introduce un correo electrónico válido."
          : "Please enter a valid email address.",
      );
      return;
    }

    setError(null);

    const details: AttendeeDetails = {
      name: trimmedName,
      email: trimmedEmail,
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    };

    if (mode === "inquiry") {
      onConfirmInquiry?.(details);
      toast.success(t.toasts.inquirySent);
      setCompleted({ mode: "inquiry", session: null, email: trimmedEmail });
      return;
    }

    if (!session) return;

    if (mode === "waitlist") {
      const res = onConfirmWaitlist(session.id, details);
      if (!res.ok) {
        setError(
          locale === "es"
            ? "Ya estás en la lista de espera para esta sesión."
            : "You're already on the waitlist for this session.",
        );
        return;
      }
      toast.success(t.toasts.waitlisted(session.name));
      setCompleted({ mode: "waitlist", session, email: trimmedEmail });
      return;
    }

    const res = onConfirmBook(session.id, details);
    if (!res.ok) {
      if (res.reason === "already_booked") {
        setError(t.booking.alreadyBooked);
        toast.info(t.toasts.alreadyBooked);
      } else {
        setError(
          locale === "es"
            ? "Esta sesión ya está completa."
            : "This session is full — try joining the waitlist instead.",
        );
      }
      return;
    }

    toast.success(t.toasts.booked(session.name));
    setCompleted({ mode: "book", session, email: trimmedEmail });
  };

  const handleDownloadIcs = (target: Session) => {
    downloadIcsFile(target);
    toast.success(t.toasts.calendarDownloaded);
  };

  const showForm = !completed && (mode === "inquiry" || Boolean(session));

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-border bg-card sm:max-w-md"
      >
        {showForm && (
          <form className="flex min-h-full flex-col gap-5 pt-4" onSubmit={handleSubmit} noValidate>
            <SheetHeader className="p-0 text-left">
              {mode === "waitlist" && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {t.booking.waitlistBadge}
                </p>
              )}
              <SheetTitle className="font-display text-3xl uppercase">
                {mode === "inquiry" ? t.booking.inquiryTitle : session?.name}
              </SheetTitle>
              <SheetDescription>
                {mode === "inquiry"
                  ? t.booking.inquiryDescription
                  : session
                    ? `${DAYS[session.day]} · ${session.time} · ${session.duration} min · ${session.spot}`
                    : ""}
              </SheetDescription>
            </SheetHeader>

            {session && mode !== "inquiry" && (
              <div className="rounded-sm border border-border bg-background/60 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-primary">
                    {mode === "waitlist" ? t.schedule.full : t.hero.spotsLeft(session.spots)}
                  </span>
                  <span className="font-semibold text-foreground">
                    {locale === "es" ? `${session.priceEur} €` : `€${session.priceEur}`}
                  </span>
                </div>
                <p className="mt-1.5 flex items-start gap-1.5 text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span>{session.meetingPoint}</span>
                </p>
              </div>
            )}

            {alreadyBooked && mode === "book" && (
              <p className="rounded-sm border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                {t.booking.alreadyBooked}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
              >
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="bk-name">{t.booking.nameLabel}</Label>
              <Input
                id="bk-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bk-email">{t.booking.emailLabel}</Label>
              <Input
                id="bk-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bk-phone">{t.booking.phoneLabel}</Label>
              <Input
                id="bk-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bk-notes">{t.booking.notesLabel}</Label>
              <Textarea
                id="bk-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.booking.notesPlaceholder}
              />
            </div>

            <div className="mt-auto space-y-3 pt-2">
              {mode === "book" && session && (
                <p className="text-xs text-muted-foreground">
                  {t.booking.policyNote.replace("{price}", String(session.priceEur))}
                </p>
              )}
              {mode === "waitlist" && (
                <p className="text-xs text-muted-foreground">{t.booking.waitlistPolicyNote}</p>
              )}
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full text-base font-semibold"
                disabled={alreadyBooked && mode === "book"}
              >
                {mode === "inquiry"
                  ? t.booking.confirmInquiry
                  : mode === "waitlist"
                    ? t.booking.confirmWaitlist
                    : t.booking.confirmBooking}
              </Button>
            </div>
          </form>
        )}

        {completed && (
          <div className="flex min-h-full flex-col items-start gap-5 pt-10">
            <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
              {completed.mode === "waitlist" ? <Clock className="size-6" /> : <Check />}
            </span>

            <SheetHeader className="p-0 text-left">
              <SheetTitle className="font-display text-4xl uppercase">
                {completed.mode === "inquiry"
                  ? t.booking.inquiryDoneTitle
                  : completed.mode === "waitlist"
                    ? t.booking.waitlistDoneTitle
                    : t.booking.bookedTitle}
              </SheetTitle>
              <SheetDescription className="text-base">
                {completed.mode === "inquiry"
                  ? locale === "es"
                    ? `Hemos recibido tu consulta 1:1. Alex responderá a ${completed.email} en menos de 24 horas.`
                    : `Your 1:1 inquiry is in. Alex will reply to ${completed.email} within 24 hours.`
                  : completed.session
                    ? `${completed.session.name} — ${DAYS[completed.session.day]} ${completed.session.time} · ${completed.session.spot}. ${
                        locale === "es" ? "Detalles enviados a" : "Details sent to"
                      } ${completed.email}.`
                    : ""}
              </SheetDescription>
            </SheetHeader>

            {completed.mode === "book" && completed.session && (
              <div className="flex w-full flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDownloadIcs(completed.session!)}
                >
                  <Calendar className="size-4" />
                  {t.booking.addToCalendar}
                </Button>
                <Button type="button" variant="outline" className="flex-1" asChild>
                  <a
                    href={buildGoogleCalendarUrl(completed.session)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    {t.booking.googleCalendar}
                  </a>
                </Button>
              </div>
            )}

            <Button variant="secondary" className="mt-2" onClick={onClose}>
              {t.booking.backToSchedule}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
