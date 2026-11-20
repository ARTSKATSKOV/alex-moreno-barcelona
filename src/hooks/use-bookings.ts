import { useCallback, useEffect, useMemo, useState } from "react";
import { INITIAL_SESSIONS, bookSpot, type Session } from "@/data/schedule";

const BOOKINGS_STORAGE_KEY = "alex-moreno:bookings";
const WAITLIST_STORAGE_KEY = "alex-moreno:waitlist";

export interface AttendeeDetails {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface BookingRecord extends AttendeeDetails {
  sessionId: string;
  bookedAt: string;
}

export interface WaitlistRecord {
  sessionId: string;
  joinedAt: string;
  name: string;
  email: string;
  phone?: string;
}

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota / privacy mode errors.
  }
}

export function useBookings(initialSessions: Session[] = INITIAL_SESSIONS) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount so SSR and initial client render match.
  useEffect(() => {
    const storedBookings = safeReadJson<BookingRecord[]>(BOOKINGS_STORAGE_KEY, []);
    const storedWaitlist = safeReadJson<WaitlistRecord[]>(WAITLIST_STORAGE_KEY, []);
    setBookings(Array.isArray(storedBookings) ? storedBookings : []);
    setWaitlist(Array.isArray(storedWaitlist) ? storedWaitlist : []);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    safeWriteJson(BOOKINGS_STORAGE_KEY, bookings);
  }, [bookings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    safeWriteJson(WAITLIST_STORAGE_KEY, waitlist);
  }, [waitlist, hydrated]);

  const bookedIds = useMemo(() => new Set(bookings.map((b) => b.sessionId)), [bookings]);
  const waitlistedIds = useMemo(() => new Set(waitlist.map((w) => w.sessionId)), [waitlist]);

  // Derive live spot counts from initial sessions minus active user bookings.
  const sessions = useMemo(() => {
    let next = initialSessions;
    for (const record of bookings) {
      const match = next.find((s) => s.id === record.sessionId);
      if (match && match.spots > 0) {
        next = bookSpot(next, record.sessionId);
      }
    }
    return next;
  }, [initialSessions, bookings]);

  const isBooked = useCallback((sessionId: string) => bookedIds.has(sessionId), [bookedIds]);
  const isWaitlisted = useCallback(
    (sessionId: string) => waitlistedIds.has(sessionId),
    [waitlistedIds],
  );

  const book = useCallback(
    (sessionId: string, details: AttendeeDetails): { ok: true } | { ok: false; reason: string } => {
      if (bookedIds.has(sessionId)) {
        return { ok: false, reason: "already_booked" };
      }
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) {
        return { ok: false, reason: "not_found" };
      }
      if (target.spots <= 0) {
        return { ok: false, reason: "full" };
      }

      const record: BookingRecord = {
        sessionId,
        bookedAt: new Date().toISOString(),
        name: details.name.trim(),
        email: details.email.trim(),
        ...(details.phone?.trim() ? { phone: details.phone.trim() } : {}),
        ...(details.notes?.trim() ? { notes: details.notes.trim() } : {}),
      };

      setBookings((prev) => [...prev, record]);
      // If the user was somehow on the waitlist for this session, remove them.
      setWaitlist((prev) => prev.filter((w) => w.sessionId !== sessionId));
      return { ok: true };
    },
    [bookedIds, sessions],
  );

  const cancel = useCallback((sessionId: string) => {
    setBookings((prev) => prev.filter((b) => b.sessionId !== sessionId));
  }, []);

  const joinWaitlist = useCallback(
    (
      sessionId: string,
      details: Pick<AttendeeDetails, "name" | "email" | "phone">,
    ): { ok: true } | { ok: false; reason: string } => {
      if (waitlistedIds.has(sessionId)) {
        return { ok: false, reason: "already_waitlisted" };
      }
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) {
        return { ok: false, reason: "not_found" };
      }

      const record: WaitlistRecord = {
        sessionId,
        joinedAt: new Date().toISOString(),
        name: details.name.trim(),
        email: details.email.trim(),
        ...(details.phone?.trim() ? { phone: details.phone.trim() } : {}),
      };

      setWaitlist((prev) => [...prev, record]);
      return { ok: true };
    },
    [waitlistedIds, sessions],
  );

  const leaveWaitlist = useCallback((sessionId: string) => {
    setWaitlist((prev) => prev.filter((w) => w.sessionId !== sessionId));
  }, []);

  return {
    sessions,
    bookings,
    waitlist,
    hydrated,
    isBooked,
    isWaitlisted,
    book,
    cancel,
    joinWaitlist,
    leaveWaitlist,
  };
}
