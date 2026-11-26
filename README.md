# Alex Moreno — Strength & Conditioning (Barcelona)

Web platform for **Alex Moreno**, an NSCA-certified strength & conditioning coach in Barcelona. Built for discovering, filtering, and booking small-group studio/outdoor sessions and submitting private 1:1 coaching inquiries across five Barcelona locations (**Eixample Studio**, **Barceloneta Beach**, **Parc de la Ciutadella**, **Montjuïc**, and **Poblenou**).

---

## Features

- **Interactive Weekly Schedule:** Filter 15 weekly classes by day or full-week view, Studio vs. Outdoor, training focus (`Strength`, `Conditioning`, `Mobility`), and specific Barcelona neighborhoods.
- **Booking, Waitlist & 1:1 Inquiries:** Unified slide-over flow (`BookingSheet`) with Zod validation, duplicate-booking guards, live spot tracking, and a **My Bookings** drawer.
- **Calendar Integration:** Client-side `.ics` file generation (Apple Calendar / Outlook) and pre-filled Google Calendar deep links (`src/lib/calendar.ts`).
- **Bilingual (`EN` / `ES`):** Instant English/Spanish toggle persisted in `localStorage` (`src/hooks/use-language.tsx`).
- **SSR SEO & Structured Data:** Canonical URLs, `hreflang` alternates, custom `1200×630` Open Graph / X cards, and Schema.org JSON-LD (`SportsActivityLocation` + `FAQPage`) rendered via TanStack Start SSR.
- **Error Monitoring & Analytics:** Integrated `@sentry/react` error boundaries + user feedback and `@vercel/analytics`.

> **Architecture Note:** Reservations currently persist client-side in `localStorage` (`src/hooks/use-bookings.ts`) against static session definitions (`src/data/schedule.ts`). Full-stack persistence, RBAC portals (`/client/*`, `/admin/*`), Auth, and Resend transactional emails on **Supabase** (`AlexMorenoBarcelona`, `eu-west-1`) are specified in [`Implementation/IMPLEMENTATION_PLAN.md`](./Implementation/IMPLEMENTATION_PLAN.md).

---

## Tech Stack

| Layer                  | Technologies                                                                                                                                                         |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework & SSR**    | [TanStack Start](https://tanstack.com/start), [TanStack Router](https://tanstack.com/router), [TanStack Query](https://tanstack.com/query), React 19, TypeScript 5.8 |
| **Build & Server**     | Vite 8, Nitro (`@lovable.dev/vite-tanstack-config`)                                                                                                                  |
| **Styling & UI**       | Tailwind CSS v4 (`oklch` design tokens in `src/styles.css`), `shadcn/ui` (`@radix-ui/*`), Lucide Icons, Sonner, Vaul, Recharts                                       |
| **Forms & Validation** | React Hook Form, `@hookform/resolvers`, Zod                                                                                                                          |
| **Backend (Planned)**  | Supabase (PostgreSQL 17, Auth, Storage, Edge Functions, Realtime)                                                                                                    |
| **Observability**      | Sentry (`@sentry/react`), Vercel Analytics (`@vercel/analytics`)                                                                                                     |
| **Testing & Quality**  | Vitest 4, React Testing Library (`jsdom`), ESLint 9, Prettier                                                                                                        |

---

## Project Structure

```text
├── Implementation/                  # Implementation plans & architecture specs
│   ├── IMPLEMENTATION_PLAN.md       # Full-stack Supabase backend, Auth & portals plan
│   ├── IMPLEMENTATION_IMPROVEMENTS.MD # Completed frontend V2 UX & booking enhancements
│   └── IMPLEMENTATION_METADATA.md   # Completed SEO, Open Graph & JSON-LD spec
├── public/                          # Static assets (og-image, favicons, robots.txt, sitemap.xml)
├── src/
│   ├── assets/                      # Photography for hero, studio, coach & outdoor spots
│   ├── components/
│   │   ├── site/                    # Domain sections (Header, Schedule, BookingSheet, Pricing, etc.)
│   │   └── ui/                      # Reusable shadcn/ui primitives
│   ├── data/                        # Session schedule, bilingual copy (i18n), site data & SEO metadata
│   ├── hooks/                       # useBookings, useLanguage, useMobile
│   ├── lib/                         # Calendar (.ics/GCal), Sentry setup, error boundaries & utils
│   ├── routes/                      # TanStack file-based routes (__root.tsx, index.tsx)
│   ├── test/                        # Test setup & routing integration tests
│   ├── router.tsx                   # TanStack Router configuration
│   ├── server.ts                    # SSR server entry wrapper
│   └── styles.css                   # Tailwind v4 entry & dark editorial theme tokens
├── GITHUB_ISSUES_GUIDE.md           # GitHub Issues & Milestones workflow manual
└── SENTRY_GUIDE.md                  # Sentry DSN & environment setup guide
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+ and **npm** (or **Bun**)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Available variables:

| Variable          | Description                                                                                                 |
| :---------------- | :---------------------------------------------------------------------------------------------------------- |
| `VITE_SITE_URL`   | Public origin used for canonical URLs and Open Graph image resolution (defaults to production URL)          |
| `VITE_SENTRY_DSN` | Optional Sentry client DSN for error reporting & user feedback (see [`SENTRY_GUIDE.md`](./SENTRY_GUIDE.md)) |

### 3. Run the development server

```bash
npm run dev
```

---

## Scripts

| Command              | Description                                     |
| :------------------- | :---------------------------------------------- |
| `npm run dev`        | Start Vite + TanStack Start dev server with HMR |
| `npm run build`      | Build production client & SSR bundle            |
| `npm run preview`    | Preview the production build locally            |
| `npm test`           | Run Vitest unit & component test suite once     |
| `npm run test:watch` | Run Vitest in interactive watch mode            |
| `npm run lint`       | Lint TypeScript/React sources with ESLint       |
| `npm run format`     | Format repository files with Prettier           |

---

## Documentation

- [`Implementation/IMPLEMENTATION_PLAN.md`](./Implementation/IMPLEMENTATION_PLAN.md) — Full-stack Supabase schema, Auth/RBAC, Edge Functions, Client & Admin portals roadmap
- [`Implementation/IMPLEMENTATION_IMPROVEMENTS.MD`](./Implementation/IMPLEMENTATION_IMPROVEMENTS.MD) — Frontend V2 architecture, schedule & UX checklist
- [`Implementation/IMPLEMENTATION_METADATA.md`](./Implementation/IMPLEMENTATION_METADATA.md) — SEO, Open Graph, manifest & JSON-LD implementation details
- [`GITHUB_ISSUES_GUIDE.md`](./GITHUB_ISSUES_GUIDE.md) — Issue & Milestone tracking conventions (`ARTSKATSKOV/alex-moreno-barcelona`)
- [`SENTRY_GUIDE.md`](./SENTRY_GUIDE.md) — Sentry setup for local development and Vercel
