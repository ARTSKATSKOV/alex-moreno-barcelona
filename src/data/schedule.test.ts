import { describe, expect, it } from "vitest";
import {
  INITIAL_SESSIONS,
  bookSpot,
  cancelSpot,
  getNextAvailableSession,
  getNextSessionDate,
  getUpcomingWeekDates,
  getWeekdayIndex,
} from "./schedule";

describe("booking & cancellation", () => {
  it("takes one spot from the booked class only", () => {
    const s = INITIAL_SESSIONS.find((x) => x.spots === 2)!;
    const next = bookSpot(INITIAL_SESSIONS, s.id);
    expect(next.find((x) => x.id === s.id)!.spots).toBe(1);
    expect(next.filter((x) => x.id !== s.id)).toEqual(
      INITIAL_SESSIONS.filter((x) => x.id !== s.id),
    );
  });

  it("refuses a full class", () => {
    const full = INITIAL_SESSIONS.find((x) => x.spots === 0)!;
    expect(() => bookSpot(INITIAL_SESSIONS, full.id)).toThrow("Session is full");
  });

  it("returns one spot on cancel and caps at capacity", () => {
    const s = INITIAL_SESSIONS.find((x) => x.spots === 2)!;
    const afterCancel = cancelSpot(INITIAL_SESSIONS, s.id);
    expect(afterCancel.find((x) => x.id === s.id)!.spots).toBe(3);

    const atCap = INITIAL_SESSIONS.map((x) => (x.id === s.id ? { ...x, spots: x.capacity } : x));
    const stillCapped = cancelSpot(atCap, s.id);
    expect(stillCapped.find((x) => x.id === s.id)!.spots).toBe(s.capacity);
  });
});

describe("date helpers", () => {
  it("maps JS weekdays to Mon=0 .. Sun=6", () => {
    // 2026-11-20 is a Friday (day index 4)
    expect(getWeekdayIndex(new Date(2026, 10, 20, 10, 0))).toBe(4);
    // 2026-11-22 is a Sunday (day index 6)
    expect(getWeekdayIndex(new Date(2026, 10, 22, 10, 0))).toBe(6);
    // 2026-11-16 is a Monday (day index 0)
    expect(getWeekdayIndex(new Date(2026, 10, 16, 10, 0))).toBe(0);
  });

  it("builds Mon..Sun dates for the current week with isToday & isPast", () => {
    // Friday, Nov 20, 2026 -> Mon is Nov 16, Sun is Nov 22
    const week = getUpcomingWeekDates(new Date(2026, 10, 20, 9, 0));
    expect(week).toHaveLength(7);
    expect(week[0]!.dayOfMonth).toBe(16);
    expect(week[0]!.isPast).toBe(true);
    expect(week[4]!.dayOfMonth).toBe(20);
    expect(week[4]!.isToday).toBe(true);
    expect(week[4]!.isPast).toBe(false);
    expect(week[6]!.dayOfMonth).toBe(22);
    expect(week[6]!.isPast).toBe(false);
  });

  it("rolls a same-day session to next week once its start time has passed", () => {
    const fridayMorning = INITIAL_SESSIONS.find((s) => s.day === 4 && s.time === "07:00")!;
    const before = getNextSessionDate(fridayMorning, new Date(2026, 10, 20, 6, 30));
    expect(before.getDate()).toBe(20);

    const after = getNextSessionDate(fridayMorning, new Date(2026, 10, 20, 7, 15));
    expect(after.getDate()).toBe(27);
  });

  it("finds the soonest available session and skips full ones", () => {
    // Tuesday Nov 17, 2026 at 12:00 -> Tue 18:30 Barbell Strength is full (0 spots),
    // so next available should be Wed 07:00 Strength Foundations.
    const match = getNextAvailableSession(INITIAL_SESSIONS, new Date(2026, 10, 17, 12, 0));
    expect(match).not.toBeNull();
    expect(match!.session.day).toBe(2);
    expect(match!.session.time).toBe("07:00");
    expect(match!.isToday).toBe(false);

    // If all sessions are full, returns null
    const allFull = INITIAL_SESSIONS.map((s) => ({ ...s, spots: 0 }));
    expect(getNextAvailableSession(allFull, new Date(2026, 10, 17, 12, 0))).toBeNull();
  });
});
