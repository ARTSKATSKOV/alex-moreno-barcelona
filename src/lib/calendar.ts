import { getNextSessionDate, type Session } from "@/data/schedule";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Formats a Date as local floating iCalendar timestamp YYYYMMDDTHHMMSS. */
function formatLocalIcsDate(date: Date): string {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

/** Formats a Date as UTC iCalendar timestamp YYYYMMDDTHHMMSSZ (for DTSTAMP). */
function formatUtcIcsDate(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/** Escapes special characters per RFC 5545 TEXT rules. */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Builds an RFC 5545 .ics calendar invite string for a given session. */
export function buildIcsContent(session: Session, referenceDate: Date = new Date()): string {
  const start = getNextSessionDate(session, referenceDate);
  const end = new Date(start.getTime() + session.duration * 60_000);
  const location = `${session.spot} — ${session.meetingPoint}, Barcelona`;
  const description = [
    `${session.name} (${session.focus} · ${session.place}) with Coach Alex Moreno.`,
    session.description,
    `Meeting point: ${session.meetingPoint}`,
    `Maps: ${session.mapsUrl}`,
  ].join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Alex Moreno//Strength & Conditioning Barcelona//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${session.id}-${formatLocalIcsDate(start)}@alexmoreno.fit`,
    `DTSTAMP:${formatUtcIcsDate(referenceDate)}`,
    `DTSTART;TZID=Europe/Madrid:${formatLocalIcsDate(start)}`,
    `DTEND;TZID=Europe/Madrid:${formatLocalIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(`${session.name} — Alex Moreno`)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}

/** Triggers a browser download of the .ics file for a booked session. */
export function downloadIcsFile(session: Session, referenceDate: Date = new Date()): void {
  if (typeof window === "undefined") return;
  const content = buildIcsContent(session, referenceDate);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `alex-moreno-${slugify(session.name)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Builds a pre-filled Google Calendar event creation URL for a booked session. */
export function buildGoogleCalendarUrl(session: Session, referenceDate: Date = new Date()): string {
  const start = getNextSessionDate(session, referenceDate);
  const end = new Date(start.getTime() + session.duration * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${session.name} — Alex Moreno`,
    dates: `${formatLocalIcsDate(start)}/${formatLocalIcsDate(end)}`,
    ctz: "Europe/Madrid",
    location: `${session.spot} (${session.meetingPoint}), Barcelona`,
    details: `${session.description}\n\nMeeting point: ${session.meetingPoint}\nMaps: ${session.mapsUrl}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
