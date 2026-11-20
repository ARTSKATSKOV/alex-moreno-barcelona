export type Focus = "Strength" | "Conditioning" | "Mobility";
export type Place = "Studio" | "Outdoor";
export interface Session {
  id: string;
  day: number; // 0 = Mon
  time: string;
  name: string;
  focus: Focus;
  place: Place;
  spot: string;
  duration: number;
  capacity: number;
  spots: number;
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const base: Omit<Session, "id">[] = [
  { day: 0, time: "07:00", name: "Strength Foundations", focus: "Strength", place: "Studio", spot: "Eixample Studio", duration: 60, capacity: 6, spots: 2 },
  { day: 0, time: "13:00", name: "Lunch Express", focus: "Conditioning", place: "Outdoor", spot: "Parc de la Ciutadella", duration: 45, capacity: 8, spots: 5 },
  { day: 0, time: "19:00", name: "Mobility Reset", focus: "Mobility", place: "Studio", spot: "Eixample Studio", duration: 45, capacity: 8, spots: 6 },
  { day: 1, time: "07:00", name: "Beach Conditioning", focus: "Conditioning", place: "Outdoor", spot: "Barceloneta Beach", duration: 45, capacity: 10, spots: 1 },
  { day: 1, time: "18:30", name: "Barbell Strength", focus: "Strength", place: "Studio", spot: "Eixample Studio", duration: 60, capacity: 6, spots: 0 },
  { day: 2, time: "07:00", name: "Strength Foundations", focus: "Strength", place: "Studio", spot: "Eixample Studio", duration: 60, capacity: 6, spots: 3 },
  { day: 2, time: "13:00", name: "Urban Circuit", focus: "Conditioning", place: "Outdoor", spot: "Poblenou", duration: 45, capacity: 8, spots: 4 },
  { day: 2, time: "19:30", name: "Mobility Reset", focus: "Mobility", place: "Studio", spot: "Eixample Studio", duration: 45, capacity: 8, spots: 7 },
  { day: 3, time: "07:00", name: "Hill Intervals", focus: "Conditioning", place: "Outdoor", spot: "Montjuïc", duration: 50, capacity: 8, spots: 2 },
  { day: 3, time: "18:30", name: "Barbell Strength", focus: "Strength", place: "Studio", spot: "Eixample Studio", duration: 60, capacity: 6, spots: 4 },
  { day: 4, time: "07:00", name: "Beach Conditioning", focus: "Conditioning", place: "Outdoor", spot: "Barceloneta Beach", duration: 45, capacity: 10, spots: 6 },
  { day: 4, time: "13:00", name: "Strength Express", focus: "Strength", place: "Studio", spot: "Eixample Studio", duration: 45, capacity: 6, spots: 1 },
  { day: 5, time: "09:00", name: "Park Strength", focus: "Strength", place: "Outdoor", spot: "Parc de la Ciutadella", duration: 60, capacity: 10, spots: 3 },
  { day: 5, time: "11:00", name: "Mobility Flow", focus: "Mobility", place: "Outdoor", spot: "Barceloneta Beach", duration: 45, capacity: 12, spots: 9 },
  { day: 6, time: "10:00", name: "Sunday Long Session", focus: "Conditioning", place: "Outdoor", spot: "Montjuïc", duration: 60, capacity: 10, spots: 5 },
];

export const INITIAL_SESSIONS: Session[] = base.map((s, i) => ({ ...s, id: `s${i}` }));

/** Returns a new list with one spot taken from the given session. Throws when full. */
export function bookSpot(sessions: Session[], id: string): Session[] {
  const target = sessions.find((s) => s.id === id);
  if (!target) throw new Error("Session not found");
  if (target.spots <= 0) throw new Error("Session is full");
  return sessions.map((s) => (s.id === id ? { ...s, spots: s.spots - 1 } : s));
}
