import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DAYS, type Session } from "@/data/schedule";
import { Check } from "lucide-react";

export function BookingSheet({ session, onClose, onConfirm }: { session: Session | null; onClose: () => void; onConfirm: (id: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<Session | null>(null);
  useEffect(() => { if (session) setDone(null); }, [session]);
  const shown = done ?? session;

  return (
    <Sheet open={!!session} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full border-border bg-card sm:max-w-md">
        {shown && !done && (
          <form
            className="flex h-full flex-col gap-6 pt-4"
            onSubmit={(e) => { e.preventDefault(); onConfirm(shown.id); setDone(shown); }}
          >
            <SheetHeader className="p-0">
              <SheetTitle className="font-display text-3xl uppercase">{shown.name}</SheetTitle>
              <SheetDescription>{DAYS[shown.day]} · {shown.time} · {shown.duration} min · {shown.spot}</SheetDescription>
            </SheetHeader>
            <p className="text-sm text-primary">{shown.spots} {shown.spots === 1 ? "spot" : "spots"} left</p>
            <div className="space-y-2"><Label htmlFor="bk-name">Name</Label><Input id="bk-name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
            <div className="space-y-2"><Label htmlFor="bk-email">Email</Label><Input id="bk-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
            <Button type="submit" size="lg" className="mt-auto h-12 text-base font-semibold">Confirm booking</Button>
          </form>
        )}
        {done && (
          <div className="flex h-full flex-col items-start gap-4 pt-10">
            <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"><Check /></span>
            <SheetTitle className="font-display text-4xl uppercase">You're booked</SheetTitle>
            <SheetDescription className="text-base">{done.name} — {DAYS[done.day]} {done.time} at {done.spot}. Details go to {email}.</SheetDescription>
            <Button variant="secondary" className="mt-4" onClick={onClose}>Back to schedule</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
