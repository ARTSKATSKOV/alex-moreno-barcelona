# Alex Moreno — Booking-focused trainer site

Single page at `/`, mobile-first, dark base with orange used only for CTAs, highlights and availability.

## Sections
1. **Hero** — headline e.g. "Stronger. Consistent. In 45 minutes." Line on studio + outdoor training in Barcelona. "Book Your Session" button (scrolls to schedule) + "View Schedule" link. Full-bleed outdoor training photo.
2. **Schedule** — Mon–Sun day switcher; timetable rows with time, class name, focus tag (Strength / Conditioning / Mobility), location tag (Studio / Outdoor), duration, spots left (orange when 3 or fewer, "Full" when 0), and a Book button per row.
3. **Trust** — coach portrait, 3 short credibility bullets, studio + outdoor image pair.
4. **Social proof** — 4–6 one-line testimonials (first name, age, profession), photo grid of studio and outdoor sessions.
5. **Logistics** — base Barcelona; outdoor spots (Ciutadella, Barceloneta beach, Montjuïc, Poblenou); 45–60 min sessions; what to bring; for / not for.
6. **Final CTA** — large section with image and "Book Your Session".

## Booking flow (no backend)
- Book opens a slide-over drawer: class summary, Name + Email, Confirm.
- Confirming lowers that class's spots in on-page memory and shows a confirmation in the drawer. Resets when the page reloads.
- Sticky bottom "Book" bar on mobile; header button on desktop.

## Design
- Fonts: condensed display font (e.g. Barlow Condensed) for headings, clean sans (e.g. Manrope) for body.
- Near-black / graphite base, warm off-white text, one orange accent.
- Generated, realistic, performance-focused photos (hero, portrait, studio, 3 outdoor, community grid).

## Technical details
- Rewrite `src/routes/index.tsx` with head metadata; update root title/description.
- Components under `src/components/site/`; schedule data in `src/data/schedule.ts`; booking state with React state + shadcn Sheet.
- Small test for booking rule: booking decrements spots, a full class cannot be booked.
