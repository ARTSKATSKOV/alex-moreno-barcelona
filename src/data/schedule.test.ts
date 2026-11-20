import { describe, expect, it } from "vitest";
import { bookSpot, INITIAL_SESSIONS } from "./schedule";

describe("booking", () => {
  it("takes one spot from the booked class only", () => {
    const s = INITIAL_SESSIONS.find((x) => x.spots === 2)!;
    const next = bookSpot(INITIAL_SESSIONS, s.id);
    expect(next.find((x) => x.id === s.id)!.spots).toBe(1);
    expect(next.filter((x) => x.id !== s.id)).toEqual(INITIAL_SESSIONS.filter((x) => x.id !== s.id));
  });
  it("refuses a full class", () => {
    const full = INITIAL_SESSIONS.find((x) => x.spots === 0)!;
    expect(() => bookSpot(INITIAL_SESSIONS, full.id)).toThrow("Session is full");
  });
});
