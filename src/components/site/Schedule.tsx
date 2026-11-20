import { useState } from "react";
import { DAYS, type Session } from "@/data/schedule";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Schedule({ sessions, onBook }: { sessions: Session[]; onBook: (s: Session) => void }) {
  const [day, setDay] = useState(0);
  const list = sessions.filter((s) => s.day === day);
  return (
    <section id="schedule" className="scroll-mt-16 border-y border-border bg-card/40 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">This week</p>
            <h2 className="mt-2 text-5xl font-bold md:text-6xl">Schedule</h2>
          </div>
          <p className="text-sm text-muted-foreground">Max 6–12 per session. Live availability.</p>
        </div>
        <div role="tablist" className="mt-8 grid grid-cols-7 gap-1 rounded-sm border border-border p-1">
          {DAYS.map((d, i) => {
            const count = sessions.filter((s) => s.day === i).length;
            return (
              <button key={d} role="tab" aria-selected={day === i} onClick={() => setDay(i)}
                className={cn("rounded-sm py-2.5 text-center text-sm font-semibold transition-colors", day === i ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent")}>
                {d}<span className="block text-[10px] font-normal opacity-70">{count} cls</span>
              </button>
            );
          })}
        </div>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {list.map((s) => {
            const full = s.spots === 0; const low = s.spots > 0 && s.spots <= 3;
            return (
              <li key={s.id} className="grid grid-cols-[4rem_1fr] items-center gap-x-4 gap-y-3 py-5 md:grid-cols-[5rem_1fr_9rem_8rem]">
                <div className="font-display text-3xl font-bold tabular-nums">{s.time}</div>
                <div>
                  <h3 className="text-2xl font-bold">{s.name}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-sm bg-secondary px-2 py-0.5 font-medium">{s.focus}</span>
                    <span className={cn("rounded-sm border px-2 py-0.5 font-medium", s.place === "Outdoor" ? "border-primary/50 text-primary" : "border-border text-muted-foreground")}>{s.place}</span>
                    <span className="px-1 py-0.5 text-muted-foreground">{s.duration} min · {s.spot}</span>
                  </div>
                </div>
                <div className={cn("col-start-2 text-sm font-semibold md:col-start-auto", full ? "text-muted-foreground" : low ? "text-primary" : "text-foreground")}>
                  {full ? "Full" : `${s.spots} of ${s.capacity} spots left`}
                </div>
                <Button className="col-start-2 h-11 font-semibold md:col-start-auto" disabled={full} onClick={() => onBook(s)} variant={full ? "secondary" : "default"}>
                  {full ? "Full" : "Book"}
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
