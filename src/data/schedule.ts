export type Focus = "Strength" | "Conditioning" | "Mobility";
export type Place = "Studio" | "Outdoor";
export type SessionLevel = "All levels" | "Beginner-friendly" | "Intermediate";

export interface Session {
  id: string;
  day: number; // 0 = Mon ... 6 = Sun
  time: string; // HH:mm (24h, Europe/Madrid)
  name: string;
  focus: Focus;
  place: Place;
  spot: string;
  duration: number; // minutes
  capacity: number;
  spots: number;
  description: string;
  level: SessionLevel;
  meetingPoint: string;
  mapsUrl: string;
  equipment: string[];
  priceEur: number;
}

export interface WeekDayInfo {
  day: number; // 0 = Mon ... 6 = Sun
  label: string;
  date: Date;
  dayOfMonth: number;
  isToday: boolean;
  isPast: boolean;
}

export interface NextSessionMatch {
  session: Session;
  startsAt: Date;
  isToday: boolean;
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const MAPS_URLS = {
  eixample: "https://www.google.com/maps/search/?api=1&query=Eixample+Barcelona+Spain",
  ciutadella:
    "https://www.google.com/maps/search/?api=1&query=Cascada+Monumental+Parc+de+la+Ciutadella+Barcelona",
  barceloneta: "https://www.google.com/maps/search/?api=1&query=Barceloneta+Beach+Barcelona",
  poblenou: "https://www.google.com/maps/search/?api=1&query=Rambla+del+Poblenou+Barcelona",
  montjuic: "https://www.google.com/maps/search/?api=1&query=Estadi+Olimpic+Montjuic+Barcelona",
} as const;

const base: Omit<Session, "id">[] = [
  {
    day: 0,
    time: "07:00",
    name: "Strength Foundations",
    focus: "Strength",
    place: "Studio",
    spot: "Eixample Studio",
    duration: 60,
    capacity: 6,
    spots: 2,
    description:
      "Compound lower- and upper-body lifts with progressive load tracking and individual form cues.",
    level: "All levels",
    meetingPoint: "Carrer d'Aragó, Eixample (exact door code sent on booking)",
    mapsUrl: MAPS_URLS.eixample,
    equipment: ["Barbells", "Power racks", "Kettlebells", "Dumbbells"],
    priceEur: 25,
  },
  {
    day: 0,
    time: "13:00",
    name: "Lunch Express",
    focus: "Conditioning",
    place: "Outdoor",
    spot: "Parc de la Ciutadella",
    duration: 45,
    capacity: 8,
    spots: 5,
    description:
      "High-output kettlebell and bodyweight intervals engineered to fit cleanly between work calls.",
    level: "All levels",
    meetingPoint: "North steps beside the Cascada Monumental fountain",
    mapsUrl: MAPS_URLS.ciutadella,
    equipment: ["Kettlebells", "Resistance bands", "Jump ropes"],
    priceEur: 20,
  },
  {
    day: 0,
    time: "19:00",
    name: "Mobility Reset",
    focus: "Mobility",
    place: "Studio",
    spot: "Eixample Studio",
    duration: 45,
    capacity: 8,
    spots: 6,
    description:
      "Targeted hip, thoracic, and shoulder mobility paired with end-range strength to undo desk posture.",
    level: "Beginner-friendly",
    meetingPoint: "Carrer d'Aragó, Eixample (exact door code sent on booking)",
    mapsUrl: MAPS_URLS.eixample,
    equipment: ["Mats", "Dowels", "Foam rollers", "Light bands"],
    priceEur: 20,
  },
  {
    day: 1,
    time: "07:00",
    name: "Beach Conditioning",
    focus: "Conditioning",
    place: "Outdoor",
    spot: "Barceloneta Beach",
    duration: 45,
    capacity: 10,
    spots: 1,
    description:
      "Sunrise sand carries, sled-style drags, and aerobic intervals with zero wasted time.",
    level: "All levels",
    meetingPoint: "Next to the Espigó del Gas promenade steps",
    mapsUrl: MAPS_URLS.barceloneta,
    equipment: ["Kettlebells", "Sandbags", "Battle ropes"],
    priceEur: 20,
  },
  {
    day: 1,
    time: "18:30",
    name: "Barbell Strength",
    focus: "Strength",
    place: "Studio",
    spot: "Eixample Studio",
    duration: 60,
    capacity: 6,
    spots: 0,
    description:
      "Structured squat, deadlift, and press blocks programmed on a 6-week progression cycle.",
    level: "Intermediate",
    meetingPoint: "Carrer d'Aragó, Eixample (exact door code sent on booking)",
    mapsUrl: MAPS_URLS.eixample,
    equipment: ["Olympic barbells", "Bumper plates", "Power racks"],
    priceEur: 25,
  },
  {
    day: 2,
    time: "07:00",
    name: "Strength Foundations",
    focus: "Strength",
    place: "Studio",
    spot: "Eixample Studio",
    duration: 60,
    capacity: 6,
    spots: 3,
    description:
      "Full-body hinge, squat, push, and pull progressions built for steady measurable strength.",
    level: "All levels",
    meetingPoint: "Carrer d'Aragó, Eixample (exact door code sent on booking)",
    mapsUrl: MAPS_URLS.eixample,
    equipment: ["Barbells", "Power racks", "Kettlebells", "Dumbbells"],
    priceEur: 25,
  },
  {
    day: 2,
    time: "13:00",
    name: "Urban Circuit",
    focus: "Conditioning",
    place: "Outdoor",
    spot: "Poblenou",
    duration: 45,
    capacity: 8,
    spots: 4,
    description:
      "Stair work, loaded carries, and tempo circuits using Poblenou's open waterfront plazas.",
    level: "All levels",
    meetingPoint: "Bottom of Rambla del Poblenou facing Bogatell promenade",
    mapsUrl: MAPS_URLS.poblenou,
    equipment: ["Kettlebells", "TRX straps", "Mini-bands"],
    priceEur: 20,
  },
  {
    day: 2,
    time: "19:30",
    name: "Mobility Reset",
    focus: "Mobility",
    place: "Studio",
    spot: "Eixample Studio",
    duration: 45,
    capacity: 8,
    spots: 7,
    description:
      "Joint prep, controlled articular rotations, and core stability to keep heavy lifting pain-free.",
    level: "Beginner-friendly",
    meetingPoint: "Carrer d'Aragó, Eixample (exact door code sent on booking)",
    mapsUrl: MAPS_URLS.eixample,
    equipment: ["Mats", "Dowels", "Kettlebells", "Resistance bands"],
    priceEur: 20,
  },
  {
    day: 3,
    time: "07:00",
    name: "Hill Intervals",
    focus: "Conditioning",
    place: "Outdoor",
    spot: "Montjuïc",
    duration: 50,
    capacity: 8,
    spots: 2,
    description:
      "Paced incline repeats and lower-body stamina blocks on Montjuïc's Olympic ring climbs.",
    level: "Intermediate",
    meetingPoint: "Main esplanade outside Estadi Olímpic south gate",
    mapsUrl: MAPS_URLS.montjuic,
    equipment: ["Timing cones", "Resistance bands", "Kettlebells"],
    priceEur: 20,
  },
  {
    day: 3,
    time: "18:30",
    name: "Barbell Strength",
    focus: "Strength",
    place: "Studio",
    spot: "Eixample Studio",
    duration: 60,
    capacity: 6,
    spots: 4,
    description:
      "Heavy primary lifts followed by targeted accessory work for posture and joint resilience.",
    level: "Intermediate",
    meetingPoint: "Carrer d'Aragó, Eixample (exact door code sent on booking)",
    mapsUrl: MAPS_URLS.eixample,
    equipment: ["Olympic barbells", "Bumper plates", "Power racks"],
    priceEur: 25,
  },
  {
    day: 4,
    time: "07:00",
    name: "Beach Conditioning",
    focus: "Conditioning",
    place: "Outdoor",
    spot: "Barceloneta Beach",
    duration: 45,
    capacity: 10,
    spots: 6,
    description:
      "Energetic Friday morning conditioning mix of kettlebell complexes, carries, and aerobic finishers.",
    level: "All levels",
    meetingPoint: "Next to the Espigó del Gas promenade steps",
    mapsUrl: MAPS_URLS.barceloneta,
    equipment: ["Kettlebells", "Sandbags", "Battle ropes"],
    priceEur: 20,
  },
  {
    day: 4,
    time: "13:00",
    name: "Strength Express",
    focus: "Strength",
    place: "Studio",
    spot: "Eixample Studio",
    duration: 45,
    capacity: 6,
    spots: 1,
    description:
      "Focused 45-minute supersets hitting two main strength lifts and core before heading back to work.",
    level: "All levels",
    meetingPoint: "Carrer d'Aragó, Eixample (exact door code sent on booking)",
    mapsUrl: MAPS_URLS.eixample,
    equipment: ["Barbells", "Dumbbells", "Kettlebells"],
    priceEur: 22,
  },
  {
    day: 5,
    time: "09:00",
    name: "Park Strength",
    focus: "Strength",
    place: "Outdoor",
    spot: "Parc de la Ciutadella",
    duration: 60,
    capacity: 10,
    spots: 3,
    description:
      "Weekend full-body kettlebell and suspension strength session in the shade of Ciutadella.",
    level: "All levels",
    meetingPoint: "North steps beside the Cascada Monumental fountain",
    mapsUrl: MAPS_URLS.ciutadella,
    equipment: ["Kettlebells", "TRX straps", "Sandbags"],
    priceEur: 22,
  },
  {
    day: 5,
    time: "11:00",
    name: "Mobility Flow",
    focus: "Mobility",
    place: "Outdoor",
    spot: "Barceloneta Beach",
    duration: 45,
    capacity: 12,
    spots: 9,
    description:
      "Active mobility, breathwork, and core control by the sea to recover from a heavy training week.",
    level: "Beginner-friendly",
    meetingPoint: "Next to the Espigó del Gas promenade steps",
    mapsUrl: MAPS_URLS.barceloneta,
    equipment: ["Mats", "Light bands"],
    priceEur: 18,
  },
  {
    day: 6,
    time: "10:00",
    name: "Sunday Long Session",
    focus: "Conditioning",
    place: "Outdoor",
    spot: "Montjuïc",
    duration: 60,
    capacity: 10,
    spots: 5,
    description: "Team-paced aerobic base and strength-endurance session overlooking the city.",
    level: "All levels",
    meetingPoint: "Main esplanade outside Estadi Olímpic south gate",
    mapsUrl: MAPS_URLS.montjuic,
    equipment: ["Kettlebells", "Sandbags", "Resistance bands"],
    priceEur: 22,
  },
];

export const INITIAL_SESSIONS: Session[] = base.map((s, i) => ({ ...s, id: `s${i}` }));

/** Converts JS Date.getDay() (0 = Sun) to our 0 = Mon ... 6 = Sun index. */
export function getWeekdayIndex(date: Date = new Date()): number {
  return (date.getDay() + 6) % 7;
}

/** Returns a new list with one spot taken from the given session. Throws when full. */
export function bookSpot(sessions: Session[], id: string): Session[] {
  const target = sessions.find((s) => s.id === id);
  if (!target) throw new Error("Session not found");
  if (target.spots <= 0) throw new Error("Session is full");
  return sessions.map((s) => (s.id === id ? { ...s, spots: s.spots - 1 } : s));
}

/** Returns a new list with one spot returned to the given session, capped at capacity. */
export function cancelSpot(sessions: Session[], id: string): Session[] {
  const target = sessions.find((s) => s.id === id);
  if (!target) throw new Error("Session not found");
  return sessions.map((s) =>
    s.id === id ? { ...s, spots: Math.min(s.capacity, s.spots + 1) } : s,
  );
}

/**
 * Maps day indices 0..6 (Mon..Sun) to calendar dates for the ISO week containing referenceDate,
 * flagging which day is today and which days have already passed.
 */
export function getUpcomingWeekDates(referenceDate: Date = new Date()): WeekDayInfo[] {
  const todayIdx = getWeekdayIndex(referenceDate);
  const monday = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate() - todayIdx,
  );

  return DAYS.map((label, day) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day);
    return {
      day,
      label,
      date,
      dayOfMonth: date.getDate(),
      isToday: day === todayIdx,
      isPast: day < todayIdx,
    };
  });
}

/** Parses "HH:mm" into hours and minutes. */
function parseTime(time: string): { hours: number; minutes: number } {
  const [hStr = "0", mStr = "0"] = time.split(":");
  return { hours: Number(hStr), minutes: Number(mStr) };
}

/**
 * Computes the next upcoming Date occurrence for a weekly session relative to referenceDate.
 * If the session's weekday matches today but its start time has already passed, rolls to next week.
 */
export function getNextSessionDate(session: Session, referenceDate: Date = new Date()): Date {
  const todayIdx = getWeekdayIndex(referenceDate);
  const { hours, minutes } = parseTime(session.time);
  let deltaDays = (session.day - todayIdx + 7) % 7;

  const candidate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate() + deltaDays,
    hours,
    minutes,
    0,
    0,
  );

  if (deltaDays === 0 && candidate.getTime() <= referenceDate.getTime()) {
    deltaDays = 7;
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
}

/** Finds the soonest upcoming session with at least one open spot. */
export function getNextAvailableSession(
  sessions: Session[],
  now: Date = new Date(),
): NextSessionMatch | null {
  const available = sessions.filter((s) => s.spots > 0);
  if (available.length === 0) return null;

  let best: NextSessionMatch | null = null;
  for (const session of available) {
    const startsAt = getNextSessionDate(session, now);
    if (!best || startsAt.getTime() < best.startsAt.getTime()) {
      const isToday =
        startsAt.getFullYear() === now.getFullYear() &&
        startsAt.getMonth() === now.getMonth() &&
        startsAt.getDate() === now.getDate();
      best = { session, startsAt, isToday };
    }
  }

  return best;
}
