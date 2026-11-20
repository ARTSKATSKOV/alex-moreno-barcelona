import { describe, expect, it } from "vitest";
import { INITIAL_SESSIONS } from "@/data/schedule";
import { buildGoogleCalendarUrl, buildIcsContent } from "./calendar";

describe("calendar utilities", () => {
  const session = INITIAL_SESSIONS[0]!; // Mon 07:00 Strength Foundations (60 min)
  const refDate = new Date(2026, 10, 16, 6, 0); // Mon Nov 16, 2026 06:00

  it("generates a valid RFC 5545 .ics string with Europe/Madrid timestamps", () => {
    const ics = buildIcsContent(session, refDate);
    expect(ics).toContain("BEGIN:VCALENDAR\r\n");
    expect(ics).toContain("DTSTART;TZID=Europe/Madrid:20261116T070000\r\n");
    expect(ics).toContain("DTEND;TZID=Europe/Madrid:20261116T080000\r\n");
    expect(ics).toContain("SUMMARY:Strength Foundations — Alex Moreno\r\n");
    expect(ics).toContain("END:VCALENDAR\r\n");
  });

  it("builds a pre-filled Google Calendar deep-link", () => {
    const url = new URL(buildGoogleCalendarUrl(session, refDate));
    expect(url.origin).toBe("https://calendar.google.com");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("dates")).toBe("20261116T070000/20261116T080000");
    expect(url.searchParams.get("ctz")).toBe("Europe/Madrid");
    expect(url.searchParams.get("text")).toContain(session.name);
  });
});
