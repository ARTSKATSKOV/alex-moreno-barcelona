import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { INITIAL_SESSIONS } from "@/data/schedule";
import { useBookings } from "./use-bookings";

describe("useBookings", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("books a session, prevents double booking, persists to localStorage, and restores spot on cancel", () => {
    const target = INITIAL_SESSIONS.find((s) => s.spots === 2)!;
    const { result } = renderHook(() => useBookings(INITIAL_SESSIONS));

    act(() => {
      const res = result.current.book(target.id, {
        name: "  Alex Client ",
        email: " client@example.com ",
      });
      expect(res).toEqual({ ok: true });
    });

    expect(result.current.isBooked(target.id)).toBe(true);
    expect(result.current.sessions.find((s) => s.id === target.id)!.spots).toBe(1);

    // Duplicate booking blocked
    act(() => {
      const dup = result.current.book(target.id, {
        name: "Alex Client",
        email: "client@example.com",
      });
      expect(dup).toEqual({ ok: false, reason: "already_booked" });
    });

    // Persisted in localStorage across fresh hook mount
    const { result: remounted } = renderHook(() => useBookings(INITIAL_SESSIONS));
    expect(remounted.current.isBooked(target.id)).toBe(true);
    expect(remounted.current.sessions.find((s) => s.id === target.id)!.spots).toBe(1);

    // Cancelling restores the spot
    act(() => {
      remounted.current.cancel(target.id);
    });
    expect(remounted.current.isBooked(target.id)).toBe(false);
    expect(remounted.current.sessions.find((s) => s.id === target.id)!.spots).toBe(2);
  });

  it("supports joining and leaving the waitlist on full sessions", () => {
    const full = INITIAL_SESSIONS.find((s) => s.spots === 0)!;
    const { result } = renderHook(() => useBookings(INITIAL_SESSIONS));

    act(() => {
      const bookRes = result.current.book(full.id, { name: "Test", email: "t@e.com" });
      expect(bookRes).toEqual({ ok: false, reason: "full" });

      const waitRes = result.current.joinWaitlist(full.id, {
        name: "Test",
        email: "t@e.com",
      });
      expect(waitRes).toEqual({ ok: true });
    });

    expect(result.current.isWaitlisted(full.id)).toBe(true);

    act(() => {
      result.current.leaveWaitlist(full.id);
    });

    expect(result.current.isWaitlisted(full.id)).toBe(false);
  });
});
