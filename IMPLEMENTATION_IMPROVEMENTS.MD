# Frontend Implementation Plan — Alex Moreno (Barcelona)

> **Scope:** Frontend-only improvements (zero backend required). All interactive enhancements rely on static data modules, React state, `localStorage` persistence, client-side calendar generation, CSS/Tailwind, and already-installed UI primitives (`@radix-ui/*`, `sonner`, `lucide-react`, `react-hook-form`, `zod`).

---

## Progress Overview

- [x] **Phase 1:** Data Architecture & Client-Side Foundations
- [x] **Phase 2:** Schedule Experience Power-Up
- [x] **Phase 3:** Booking Sheet, Waitlist & "My Bookings"
- [x] **Phase 4:** Conversion & Content Sections (Pricing, Formats, Locations, FAQ, Contact)
- [x] **Phase 5:** Navigation, Mobile Ergonomics, Imagery & Visual Polish
- [x] **Phase 6:** Accessibility, SEO Metadata & Verification

---

## Phase 1: Data Architecture & Client-Side Foundations

Set up clean static data models and browser-only persistence utilities so later UI phases stay modular and easy to wire up (and easy to connect to a real backend later).

### 1.1 Enrich Session Data (`src/data/schedule.ts`)
- [x] Extend the `Session` type with frontend metadata:
  - `description` (1–2 sentence preview of what the session involves)
  - `level` (e.g. `"All levels"`, `"Intermediate"`, `"Beginner-friendly"`)
  - `meetingPoint` (exact landmark, e.g. *"Cascada Fountain north steps"*) and `mapsUrl`
  - `equipment` (short list of what is provided)
  - `priceEur` (drop-in rate shown on the row and in the booking sheet)
- [x] Add pure helper functions alongside `bookSpot`:
  - `cancelSpot(sessions, id)` — returns a spot back to a session (capped at `capacity`)
  - `getUpcomingWeekDates(referenceDate)` — maps `day` indices (`0 = Mon` … `6 = Sun`) to real upcoming calendar dates and flags `isToday`
  - `getNextAvailableSession(sessions, now)` — finds the soonest upcoming session with `spots > 0` for the Hero shortcut card

### 1.2 Static Content & Bilingual Copy (`src/data/site.ts`, `src/data/i18n.ts`)
- [x] Centralize page copy and structured data currently hardcoded in `src/routes/index.tsx`:
  - Key proof stats (`10+ Years`, `1,200+ Clients`, `14 Months Avg. Stay`, `Max 6–12 / Class`)
  - Training formats comparison (**Small Group** vs. **Private 1:1**)
  - Pricing & packs (*First-Timer Trial*, *Single Drop-in*, *5-Pack / 10-Pack*, *Monthly Membership*)
  - Barcelona training locations (`Eixample Studio`, `Barceloneta Beach`, `Parc de la Ciutadella`, `Montjuïc`, `Poblenou`) with exact pins, transit notes, and matching schedule filter keys
  - FAQ items (rain/weather backup policy, 12h/24h cancellation window, beginner readiness, languages coached, equipment & lockers, private 1:1 availability)
  - Direct contact channels (WhatsApp link, Instagram, email)
- [x] Create a lightweight `EN | ES` translation dictionary and React context/hook (`src/hooks/use-language.tsx`) persisted to `localStorage`

### 1.3 Client-Side Bookings & Calendar Utilities
- [x] Create a `localStorage`-backed hook (`src/hooks/use-bookings.ts`) to store:
  - User's booked session records (`sessionId`, `bookedAt`, attendee name/email/notes)
  - User's waitlisted session IDs
  - Derived adjusted `sessions` list so spot counts stay accurate across page reloads
  - Duplicate-booking guard (prevents reserving the same session twice)
- [x] Create a pure frontend calendar helper (`src/lib/calendar.ts`):
  - Generate and trigger download of a standards-compliant `.ics` file for any booked session
  - Build a pre-filled Google Calendar event deep-link (`calendar.google.com/calendar/render?...`)

---

## Phase 2: Schedule Experience Power-Up

Transform `src/components/site/Schedule.tsx` from a basic static day list into a fast, scannable, conversion-ready booking tool.

### 2.1 Smart Default Day, Real Dates & Accessible Tabs
- [x] Replace hardcoded `useState(0)` (Monday) with auto-selection of today's weekday on mount
- [x] Display real upcoming date numbers under each weekday (`Fri 20`, `Sat 21`, etc.) with a subtle `"Today"` indicator
- [x] Migrate custom `role="tablist"` buttons to Radix `Tabs` (`src/components/ui/tabs.tsx`) so keyboard arrow navigation, `role="tabpanel"`, and `aria-controls` work properly
- [x] Fix cramped 7-column mobile layout (`grid-cols-7` on `<sm` viewports) by switching to a horizontally scrollable pill strip or roomy ≥44px tap targets on small screens

### 2.2 Filtering & Full-Week Overview
- [x] Add compact filter pills above the schedule:
  - **Place:** `All` · `Studio` · `Outdoor`
  - **Focus:** `All` · `Strength` · `Conditioning` · `Mobility`
  - **Location chip (when active):** allows filtering to a specific Barcelona spot (e.g. triggered from the Locations section) with a 1-click clear button
- [x] Add a **"By Day" / "Full Week"** view toggle so visitors can scan all 15 weekly sessions grouped by day without clicking 7 tabs
- [x] Add a clear empty state (*"No sessions match these filters"*) with a `"Reset filters"` button

### 2.3 Richer Session Rows & Waitlist / Booked States
- [x] Add subtle hover highlight and smooth transition styling to schedule rows
- [x] Add an expandable row detail toggle (or subtle info chevron) showing workout description, level badge, equipment provided, and exact meeting point with a Maps link
- [x] Show session price cleanly alongside duration/location (or clearly indicate *"Included in packs / €XX drop-in"*)
- [x] Replace the dead disabled `"Full"` button (e.g. Tuesday 18:30 `Barbell Strength`) with an active `"Join waitlist"` button
- [x] Reflect user reservation state directly on each row:
  - `"Booked ✓"` badge + inline `"Cancel"` action when already booked
  - `"On waitlist ✓"` badge + `"Leave"` option when waitlisted

---

## Phase 3: Booking Sheet, Waitlist & "My Bookings"

Upgrade `src/components/site/BookingSheet.tsx` and wire up client-side booking management and feedback.

### 3.1 Enhanced Booking Sheet (`src/components/site/BookingSheet.tsx`)
- [x] Support multiple sheet modes cleanly:
  - **Book a spot** (standard class reservation)
  - **Join waitlist** (for full sessions, adjusted copy and confirmation state)
  - **Private 1:1 inquiry** (captures preferred days/times & goal without consuming a group spot)
- [x] Sync displayed availability from the live `sessions` array rather than holding a stale snapshot in `active`
- [x] Add proper form validation and whitespace trimming (using already-installed `zod` + `react-hook-form` or clean controlled validation)
- [x] Add optional fields:
  - **WhatsApp / Phone** (for outdoor weather updates or pin changes)
  - **Notes** (*"First time? Any injuries or goals?"*)
- [x] Display transparent expectations right above the submit CTA: drop-in price, *"Pay on arrival — no card required"*, and *"Free cancellation up to 12h before"*
- [x] Wrap confirmation title/description in proper `<SheetHeader>` semantics for accessibility

### 3.2 Post-Booking Delight & Management
- [x] Add **"Add to Calendar"** actions on the confirmation screen:
  - `Download .ics` button (Apple Calendar / Outlook)
  - `Google Calendar` deep-link button
- [x] Build a **"My Bookings"** slide-over drawer (or tab inside a sheet) triggered from a compact header badge (`My Bookings (N)`):
  - Lists upcoming booked and waitlisted sessions from `localStorage`
  - Includes one-click `.ics` export, Maps pin link, and `Cancel booking` (restoring the spot in `Schedule`)
- [x] Wire up the already-mounted `sonner` `<Toaster />` (`src/routes/__root.tsx`) for crisp non-blocking feedback toasts on booking, waitlist signup, cancellation, and `.ics` download

---

## Phase 4: Conversion & Content Sections

Fill the decision-making gaps in `src/routes/index.tsx` by breaking new sections into clean components under `src/components/site/`.

### 4.1 Hero Conversion Upgrade
- [x] Remove the redundant `Book Your Session` + `View Schedule` duplicate action (both currently call `scrollToSchedule`):
  - Keep primary CTA scrolling to `#schedule`
  - Change secondary link to jump to `#pricing` or `#coach` (*"How it works & pricing"*)
- [x] Add a compact **"Next Available Session"** live shortcut card/pill in the hero (computed via `getNextAvailableSession`), allowing 1-click jump straight into booking the next open class
- [x] Add a subtle left-to-right dark scrim gradient alongside the bottom gradient and bump hero subtitle contrast (`text-foreground/80`) so text remains razor-sharp over the sunrise background on all screen sizes

### 4.2 Proof Metric Strip & Training Format Clarity
- [x] Extract coach proof metrics (`10+ Years Coaching`, `1,200+ Clients`, `14 Mo Avg. Retention`, `Max 6–12 / Class`) into a bold, scannable `Barlow Condensed` stat bar
- [x] Add a clear **Small Group vs. Private 1:1** section (or side-by-side cards) explaining:
  - What small-group sessions include (capped 6–12, programmed progression, studio + outdoor access)
  - What 1:1 personal training includes (custom schedule, tailored programming) with a direct `"Inquire for 1:1"` CTA opening the inquiry sheet

### 4.3 Pricing & First-Timer Trial (`src/components/site/Pricing.tsx`)
- [x] Add a focused, scannable `#pricing` section with transparent frontend pricing tiers:
  - **First Trial Session** (highlighted low-friction entry option)
  - **Drop-In** (single studio or outdoor class)
  - **Session Packs** (e.g. 5-pack / 10-pack with per-session savings)
  - **Monthly Consistent Plan** (e.g. 2x or 3x/week recurring slots)
- [x] Include a clear note explaining how payment works on-site / upon confirmation (no backend payment claim) and CTA buttons that scroll to `#schedule`

### 4.4 Interactive Barcelona Locations (`src/components/site/Locations.tsx`)
- [x] Elevate the 5 training spots (`Eixample Studio`, `Barceloneta Beach`, `Parc de la Ciutadella`, `Montjuïc`, `Poblenou`) from plain Logistics text into interactive location cards
- [x] Show neighborhood, indoor/outdoor badge, exact meeting landmark, nearest metro, and Google Maps link on each card
- [x] Make each card's `"See sessions here"` button smoothly scroll to `#schedule` with that exact location pre-filtered

### 4.5 Objection-Busting FAQ & Expanded Footer (`src/components/site/Faq.tsx`, `src/components/site/Footer.tsx`)
- [x] Build a compact `#faq` accordion using existing `src/components/ui/accordion.tsx` covering:
  - Rain / bad weather plan for outdoor sessions
  - Cancellation & rescheduling window
  - Beginner suitability & scaling
  - Coaching languages (`EN / ES / CAT`)
  - Equipment, showers/lockers at Eixample Studio, and what to bring
- [x] Expand the minimal 1-line footer into a practical local footer:
  - Quick anchor links (`Schedule`, `Pricing`, `Locations`, `Coach`, `FAQ`)
  - Direct contact actions (**WhatsApp**, **Instagram**, **Email**)
  - Studio neighborhood & hours summary
  - Compact `EN | ES` toggle

---

## Phase 5: Navigation, Mobile Ergonomics, Imagery & Visual Polish

Elevate craft, visual consistency, and mobile comfort across the full page.

### 5.1 Sticky Header & Mobile Navigation (`src/components/site/Header.tsx`)
- [x] Replace the duplicate `Schedule` + `Book Your Session` header links with full section navigation: `Schedule`, `Locations`, `Pricing`, `Coach`, `FAQ`
- [x] Add scroll-spy active section highlighting via `IntersectionObserver`
- [x] Place compact `EN | ES` switcher and `"My Bookings"` badge cleanly in the header
- [x] Add a tidy mobile navigation drawer (using `Sheet`) for small screens

### 5.2 Smart Mobile Sticky CTA
- [x] Observe `#schedule` and the Hero CTA with `IntersectionObserver`
- [x] Automatically hide the bottom fixed mobile CTA bar (`index.tsx`) when the user is already viewing the Hero CTA or `#schedule` (and while any sheet is open), preventing it from overlapping schedule rows or the footer

### 5.3 Photography, Brand Cohesion & Performance
- [x] Eliminate duplicate images across the page:
  - Replace the duplicate `src/assets/park.jpg` (currently used in both Coach and Clients sections) with `src/assets/montjuic.jpg`
  - Replace the duplicate `src/assets/urban.jpg` (currently used in both Clients and Final CTA background) with `src/assets/cta-studio.jpg`
- [ ] Refresh / curate remaining imagery (`hero.jpg`, `urban.jpg`, `studio.jpg`) and convert all assets to compressed **WebP / AVIF** *(deferred — no local `sharp`/`cwebp`/Pillow installed)*

### 5.4 Subtle Motion & Polish
- [x] Add lightweight, tasteful CSS transitions (staggered hero reveal, smooth filter/tab transitions, subtle card hover border emphasis)
- [x] Respect `@media (prefers-reduced-motion: reduce)` so smooth scrolling and animations disable gracefully for motion-sensitive users

---

## Phase 6: Accessibility, SEO Metadata & Verification

Ensure the upgraded frontend is accessible, clean in link previews, and reliably tested.

### 6.1 Accessibility & Semantics
- [x] Wrap main page content in a `<main id="main">` landmark and add a visually-hidden `"Skip to schedule"` link at the top of the page
- [x] Audit heading outline (`h1` → `h2` → `h3`) so no levels are skipped across new sections
- [x] Verify keyboard-only navigation across header nav, mobile drawer, filter pills, Radix `Tabs`, expandable rows, `BookingSheet`, `My Bookings`, and `FAQ` accordion (including focus return on sheet close)
- [x] Check color contrast (WCAG AA) for `text-muted-foreground` on dark cards, amber `text-primary` badges, and text layered over hero/CTA photography

### 6.2 Metadata & Brand Hygiene
- [x] Remove leftover `{ name: "twitter:site", content: "@Lovable" }` from `src/routes/__root.tsx`
- [x] Add a dedicated `og:image` and `twitter:image` meta tag to the `/` route (`src/routes/index.tsx`) for rich WhatsApp/social link previews
- [x] Review global uppercase `h1, h2, h3` rule in `src/styles.css` to ensure 404/error screens and dialog titles remain clean and legible

### 6.3 Testing & QA Checklist
- [x] Expand `src/data/schedule.test.ts` to cover:
  - `cancelSpot` behavior and capacity bounds
  - `getUpcomingWeekDates` weekday alignment & `isToday` flag
  - `getNextAvailableSession` edge cases (skipping full sessions / wrapping week)
- [x] Add frontend unit/component tests for:
  - Schedule filtering (by place, focus, location) and Full-Week view
  - Booking + waitlist flow, duplicate-booking prevention, and `localStorage` persistence
  - `.ics` calendar string generation
  - `EN | ES` language switching
- [x] Verify responsive visual QA across **375px** (small mobile), **768px** (tablet), and **1440px** (desktop) viewports *(verified live in browser at desktop & 375px mobile)*
- [x] Run `npm run lint`, `npm test`, and `npm run build` with zero errors or warnings
