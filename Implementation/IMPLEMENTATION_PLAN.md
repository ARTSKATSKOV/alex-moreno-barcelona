# Full-Stack Backend, Dashboards & Branding Implementation Plan — Alex Moreno (Barcelona)

> **Goal:** Evolve our existing Personal Trainer booking landing page (TanStack Start + React 19 + Tailwind v4 + shadcn/ui + Sentry + Vercel) into a full-stack booking platform powered by **Supabase** (PostgreSQL, Auth, Edge Functions, Storage Buckets, Realtime), with role-based **General User**, **Client**, and **Admin (Coach)** portals, full audit history, calendar availability rules/exceptions, Resend transactional emails, and a cohesive dark editorial brand system.
>
> **Confirmed Scope Decisions:**
>
> - **Account required to book:** Visitors browse `/` and `/sessions/$slug` freely; booking requires signing up/logging in so role upgrades (`user` → `client`) and bans/rejections are cleanly enforced.
> - **Auto-active signups + Admin moderation:** New accounts start as `role = 'user'`, `account_status = 'active'`. On first confirmed booking, role automatically upgrades to `'client'`. Admins can **reject** or **ban** users (and reject/cancel bookings) with mandatory reason + timestamp.
> - **In-person payments only (for now):** Simple **`Paid` / `Unpaid`** toggle per booking in Admin (clients pay on premises). Stripe online payments are explicitly out of scope and noted under Future Improvements.
> - **Transactional emails via Resend:** Edge Functions send branded emails (booking confirmation + `.ics`, cancellation, waitlist promotion, weather moves, 1:1 inquiries, moderation notices).
> - **Slug-first UI/UX:** Dedicated pages with clean slugs for all user/entity views; modals (`Dialog` / `AlertDialog`) strictly reserved for confirmations and tiny field edits.
> - **Toast position:** All screen toasts rendered at **`top-left`** (`<Toaster position="top-left" />`).

---

## Progress Overview

- [x] **Phase 0:** Supabase Setup, SDKs, Toast Position & Environment Wiring
- [x] **Phase 1:** PostgreSQL Schema, Availability Rules, Audit History Tables, Atomic RPCs & RLS
- [x] **Phase 2:** Supabase Auth, RBAC (`user` / `client` / `admin`), Ban/Reject Guards & General User Pages
- [ ] **Phase 3:** Media Storage Buckets & Upload Pipeline
- [ ] **Phase 4:** Edge Functions (Booking, Cancellation, Availability Generator, Weather Alerts, Resend Emails) & Live Public Site (`/`, `/sessions/$slug`)
- [ ] **Phase 5:** Client Portal (`/client/*`)
- [ ] **Phase 6:** Admin Portal — Dashboard, Sessions, Session Types, Availability Calendar & Bookings
- [ ] **Phase 7:** Admin Portal — Clients & Moderation, Inquiries, History Explorer, Reporting, Media & Settings
- [ ] **Phase 8:** Testing, RLS Security Audit, Observability (Sentry + SEO `noindex`) & Production Rollout

---

## 1. Branding & Shadcn UI Design System Guide

Every new page (Auth, Profile, Client Portal, Admin Portal) **must** match the exact visual language established on the main landing page (`src/styles.css`).

### 1.1 Color Palette (`oklch` Tokens — Dark-First)

| Role                 | Token / Tailwind                      | Value (`oklch`)        | Usage                                                                             |
| :------------------- | :------------------------------------ | :--------------------- | :-------------------------------------------------------------------------------- |
| **Page Ground**      | `bg-background`                       | `oklch(0.16 0.004 60)` | Deep warm charcoal canvas                                                         |
| **Elevated Surface** | `bg-card` / `bg-card/50`              | `oklch(0.20 0.005 60)` | Dashboard cards, panels, sidebar, table wrappers                                  |
| **Primary Accent**   | `bg-primary` / `text-primary`         | `oklch(0.70 0.19 47)`  | Warm athletic amber — primary CTAs, active indicators, key KPI numerals, eyebrows |
| **Primary Text**     | `text-foreground`                     | `oklch(0.95 0.008 80)` | Crisp warm off-white headlines & body                                             |
| **Secondary Text**   | `text-muted-foreground`               | `oklch(0.68 0.01 70)`  | Metadata, captions, timestamps, helper text                                       |
| **Hairline Borders** | `border-border`                       | `oklch(0.30 0.006 60)` | 1px structural dividers, grid lines, card outlines                                |
| **Destructive**      | `bg-destructive` / `text-destructive` | `oklch(0.60 0.20 27)`  | Ban user, cancel session, delete, validation errors                               |

#### Semantic Status Badges (Consistent Across All Tables & Cards)

| Status                                          | Style                                                             |
| :---------------------------------------------- | :---------------------------------------------------------------- |
| `confirmed` / `active` / `paid` / `scheduled`   | `bg-emerald-500/15 text-emerald-400 border border-emerald-500/30` |
| `waitlisted` / `moved_indoor` / `unpaid`        | `bg-primary/15 text-primary border border-primary/40`             |
| `checked_in` / `completed`                      | `bg-foreground text-background`                                   |
| `cancelled` / `no_show` / `rejected` / `banned` | `bg-destructive/15 text-destructive border border-destructive/40` |
| `user` (no bookings yet)                        | `bg-secondary text-muted-foreground border border-border`         |

### 1.2 Typography & Layout Rhythm

- **Display Headings (`h1`, `h2`, `h3`) & KPI Numbers:** `font-display` (`Barlow Condensed`), `uppercase`, tight tracking (`-0.01em`), compact line-height (`0.95`), `tabular-nums` for times, counts, prices, and metrics.
- **UI, Body, Tables & Forms:** `font-sans` (`Manrope`), crisp `-webkit-font-smoothing: antialiased`.
- **Section Eyebrows:** `text-xs font-semibold uppercase tracking-[0.2em] text-primary`.
- **Sharp Geometry (`--radius: 0.25rem`):** Stick strictly to `rounded-sm` / `rounded-md` across buttons, cards, badges, inputs, and sidebar items — avoid bubbly `rounded-2xl` or pill-heavy SaaS templates.
- **Density & Contrast:** Generous padding (`p-5` / `p-6`), hairline `1px` borders over drop shadows, subtle hover transitions (`hover:border-primary/50`, `hover:bg-accent/30`).

### 1.3 Shadcn Component Reference (All Already Installed in `src/components/ui/`)

| Pattern                         | Shadcn Component                                                                | Usage Rule                                                                                                                                                 |
| :------------------------------ | :------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Portal Navigation**           | `Sidebar`, `Breadcrumb`                                                         | Persistent left sidebar on `/admin/*` & `/client/*`; sheet drawer on mobile                                                                                |
| **Data Listings**               | `Table`, `Pagination`, `Tabs`, `Select`, `Input`                                | Bookings, Clients, Sessions, Login/Audit History                                                                                                           |
| **KPI & Detail Panels**         | `Card`, `Separator`, `Badge`, `Avatar`, `Skeleton`                              | Dashboard KPIs, client/session detail pages, loading states                                                                                                |
| **Forms**                       | `Form`, `Label`, `Input`, `Textarea`, `Select`, `Switch`, `Calendar`, `Popover` | React Hook Form + Zod on dedicated pages (`/new`, `/$slug`, `/profile`)                                                                                    |
| **Confirmations & Micro-Edits** | `AlertDialog`, `Dialog`                                                         | **Only** for destructive confirmations (Cancel Session + reason, Ban/Reject User + reason, Cancel Booking) and tiny quick-edits (inline slot/status tweak) |
| **Charts**                      | `recharts` + `Chart` (`chart.tsx`)                                              | Admin Reporting (`/admin/reporting`) styled with `--chart-1`..`--chart-5`                                                                                  |
| **Toasts**                      | `Sonner` (`<Toaster position="top-left" />`)                                    | **Always `top-left`**, crisp 1-line messages for every mutation, error, and auth event                                                                     |

---

## 2. Complete Sitemap & Slug-First Page Architecture

> **Rule:** Prefer unique, bookmarkable pages with readable slugs over multi-field modals. Use modals strictly for confirmations and single-field quick edits.

### A. Public Pages

| Route             | Purpose                                                                                                                                                                                     | Access |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----- |
| `/`               | Main landing page — live Supabase schedule, locations, pricing, FAQ, 1:1 inquiry                                                                                                            | Public |
| `/sessions/$slug` | **Suggested:** Dedicated session detail page (full workout description, live open spots, meeting point + Maps embed/link, equipment, weather notice, 1-click book or redirect to `/signup`) | Public |

### B. General User & Auth Pages

| Route                                  | Purpose                                                                                                                                                                 | Notes                             |
| :------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- |
| `/signup`                              | User registration (name, email, password, WhatsApp, `EN/ES`). Sets `role = 'user'`, preserves `?redirect=`                                                              | **Requested**                     |
| `/login`                               | Sign in (email/password + Magic Link option), records entry in `user_login_history`, checks ban/reject status                                                           | **Requested**                     |
| `/logout`                              | Signs out via Supabase Auth, clears React Query cache & Sentry user, redirects to `/` with top-left toast                                                               | **Requested**                     |
| `/profile`                             | Dedicated profile page (avatar upload to `avatars` bucket, name, WhatsApp, `EN/ES`, injuries/goals, emergency contact, password change, personal login history snippet) | **Requested**                     |
| `/forgot-password` & `/reset-password` | **Suggested:** Password recovery request & new password page                                                                                                            | Essential for email/password auth |
| `/auth/callback`                       | **Suggested:** Supabase PKCE/email confirmation/magic-link exchange route                                                                                               | Required by Supabase Auth         |
| `/account-restricted`                  | **Suggested:** Clear page shown to `banned` or `rejected` users explaining status + coach contact link                                                                  | Required for ban/reject handling  |
| `/unauthorized`                        | **Suggested:** Clean `403` screen when a `user` or `client` navigates to `/admin/*`                                                                                     | Clean RBAC UX                     |

### C. Client / User Portal Pages (`/client/*` — Authenticated `user` or `client` or `admin`)

| Route                         | Purpose                                                                                                                                                                                                                                                                                       | Notes                         |
| :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------- |
| `/client`                     | **Client Dashboard:** Next upcoming session card (countdown, meeting point, weather notice, `.ics` export), monthly consistency stats, role status (`User` prompt to book first session vs `Client` stats), quick upcoming open classes                                                       | **Requested**                 |
| `/client/bookings`            | **Booking Management:** Tabbed list (**Upcoming**, **Waitlist**, **Past & Cancelled**), filterable, links to individual booking detail pages                                                                                                                                                  | **Requested**                 |
| `/client/bookings/$bookingId` | **Suggested (Slug-first):** Dedicated booking detail page — full session info, payment status (`Paid` / `Pay on premises`), weather updates, `.ics` / Google Calendar buttons, full booking status history timeline, and Cancel confirmation modal (with 12h policy + optional cancel reason) | Replaces booking detail modal |

### D. Admin / Coach Portal Pages (`/admin/*` — Strictly `role === 'admin'`)

| Route                                                     | Purpose                                                                                                                                                                                                                                                                                                                            | Notes                         |
| :-------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------- |
| `/admin`                                                  | **Admin Dashboard:** Today's sessions + live attendee rosters with 1-click check-in & Paid/Unpaid toggle, weekly occupancy KPIs, active waitlist count, new 1:1 inquiries, recent activity feed                                                                                                                                    | **Requested**                 |
| `/admin/sessions`                                         | **Session Management List:** Filter by status (`scheduled`, `moved_indoor`, `cancelled`, `completed`), date range, session type, location; quick button to generate sessions from availability rules                                                                                                                               | **Requested**                 |
| `/admin/sessions/new`                                     | **Create Session Page:** Dedicated full-page form (select session type to prefill defaults, title, slug, description, date/time, max slots, price, location, level, equipment)                                                                                                                                                     | Slug-first (no big modal)     |
| `/admin/sessions/$slug`                                   | **Session Detail & Edit Page:** Edit fields, manage live attendee roster (check-in / paid toggle / promote waitlist / reject booking), view **Session History** timeline, and **Cancel Session** confirmation modal (captures mandatory `cancel_reason` + `cancelled_at` and emails attendees)                                     | Slug-first                    |
| `/admin/session-types`                                    | **Session Types CRUD List:** Manage reusable class types (`Strength Foundations`, `Beach Conditioning`, `Mobility Reset`, etc.)                                                                                                                                                                                                    | **Requested**                 |
| `/admin/session-types/new` & `/admin/session-types/$slug` | **Create / Edit Session Type Pages:** Default title, slug, focus, duration, max slots, price, level, equipment, description, cover image                                                                                                                                                                                           | Slug-first                    |
| `/admin/availability`                                     | **Sessions Calendar Availability Manager:** Manage ongoing vs. fixed-period availability rules (`effective_from` → `effective_until` or ongoing) AND date exceptions (blackout dates, holidays, time/location/capacity overrides, weather indoor moves) with visual calendar preview                                               | **Requested**                 |
| `/admin/bookings`                                         | **Bookings Management:** Filterable master table (status, paid/unpaid, date, session, client), quick Paid/Unpaid toggle, check-in, reject/cancel booking (modal with reason), manual booking, CSV export                                                                                                                           | **Requested**                 |
| `/admin/bookings/$bookingId`                              | **Booking Detail Page:** Full attendee details, payment toggle, status controls, and full `booking_history` audit timeline                                                                                                                                                                                                         | Slug-first                    |
| `/admin/clients`                                          | **Users & Clients Directory:** Filter by role (`user`, `client`, `admin`) and account status (`active`, `rejected`, `banned`), search by name/email, quick stats                                                                                                                                                                   | **Requested**                 |
| `/admin/clients/$userId`                                  | **User / Client Detail & Moderation Page:** Profile & injury notes, role management (`user` / `client` / `admin`), **Reject / Ban / Reinstate** confirmation modal (with reason), full **Booking History**, **Login History**, **Moderation History**, and private admin-only coaching notes                                       | Slug-first                    |
| `/admin/inquiries` & `/admin/inquiries/$inquiryId`        | **Suggested:** Inbox & detail view for Private 1:1 inquiries submitted from `/` (`new` → `contacted` → `converted` → `archived`)                                                                                                                                                                                                   | Captures existing 1:1 UI flow |
| `/admin/reporting`                                        | **Reporting & Analytics:** `recharts` dashboards (occupancy %, revenue from `paid` on-premises bookings, cancellations & top cancel reasons, no-show rates, user→client conversion funnel, Studio vs Outdoor demand, busiest time slots) + Audit History tabs (`Login History`, `Session History`, `Booking History`) + CSV export | **Requested**                 |
| `/admin/media`                                            | **Suggested:** Media library for Supabase Storage `site-media` bucket (location, studio & session-type imagery)                                                                                                                                                                                                                    | Uses Storage buckets cleanly  |
| `/admin/settings`                                         | **Settings:** Studio contact/WhatsApp/hours, cancellation policy hours (`12h`), Barcelona locations CRUD, site-wide weather/announcement banner, email notification toggles                                                                                                                                                        | **Requested**                 |

---

## 3. Supabase Database Schema, Availability Engine & Audit History

### 3.1 Core Domain Tables

1. **`profiles`** (1:1 with `auth.users.id`)
   - `id uuid primary key references auth.users(id) on delete cascade`
   - `slug text unique not null` _(auto-generated URL-friendly handle e.g. `laura-martinez-4f2a`)_
   - `role text not null default 'user' check (role in ('user', 'client', 'admin'))`
   - `account_status text not null default 'active' check (account_status in ('active', 'rejected', 'banned'))`
   - `moderation_reason text`, `moderated_at timestamptz`, `moderated_by uuid references profiles(id)`
   - `full_name text not null`, `email text not null`, `phone text`, `locale text not null default 'en' check (locale in ('en', 'es'))`
   - `avatar_url text`, `goals text`, `injuries_notes text`, `emergency_contact text`
   - `first_booked_at timestamptz`, `last_login_at timestamptz`
   - `created_at timestamptz default now()`, `updated_at timestamptz default now()`

2. **`locations`**
   - `id uuid primary key default gen_random_uuid()`, `slug text unique not null`
   - `name text not null` _(e.g. `Eixample Studio`, `Barceloneta Beach`)_
   - `place text not null check (place in ('Studio', 'Outdoor'))`
   - `neighborhood text`, `landmark_en text`, `landmark_es text`, `metro text`, `maps_url text`, `image_url text`
   - `is_active boolean not null default true`, `sort_order int not null default 0`
   - `created_at timestamptz default now()`, `updated_at timestamptz default now()`

3. **`session_types`** _(Admin CRUD — reusable session blueprints)_
   - `id uuid primary key default gen_random_uuid()`, `slug text unique not null`
   - `title text not null`, `description text not null`
   - `focus text not null check (focus in ('Strength', 'Conditioning', 'Mobility', 'Private'))`
   - `place text not null check (place in ('Studio', 'Outdoor'))`
   - `default_location_id uuid references locations(id)`
   - `default_duration_min int not null check (default_duration_min > 0)`
   - `default_max_slots int not null check (default_max_slots > 0)`
   - `default_price_eur numeric(8,2) not null check (default_price_eur >= 0)`
   - `level text not null default 'All levels'`, `equipment text[] not null default '{}'`
   - `cover_image_url text`, `is_active boolean not null default true`
   - `created_at timestamptz default now()`, `updated_at timestamptz default now()`

4. **`session_availability_rules`** _(Calendar Availability Rules — ongoing OR fixed period)_
   - `id uuid primary key default gen_random_uuid()`
   - `session_type_id uuid not null references session_types(id) on delete cascade`
   - `location_id uuid not null references locations(id)`
   - `weekday int not null check (weekday between 0 and 6)` _(0 = Mon .. 6 = Sun)_
   - `start_time time not null`, `duration_min int not null`, `max_slots int not null`, `price_eur numeric(8,2) not null`
   - `availability_mode text not null default 'ongoing' check (availability_mode in ('ongoing', 'date_range'))`
   - `effective_from date not null default current_date`
   - `effective_until date` _(NULL when `availability_mode = 'ongoing'`; required when `'date_range'`)_
   - `is_active boolean not null default true`
   - `created_by uuid references profiles(id)`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`

5. **`session_availability_exceptions`** _(Date-Specific Blackouts & Overrides)_
   - `id uuid primary key default gen_random_uuid()`
   - `availability_rule_id uuid references session_availability_rules(id) on delete cascade` _(NULL = global holiday/blackout across all sessions)_
   - `exception_date date not null`
   - `exception_type text not null check (exception_type in ('blackout', 'override_time', 'override_location', 'override_slots', 'weather_indoor'))`
   - `override_start_time time`, `override_location_id uuid references locations(id)`, `override_max_slots int`
   - `reason text not null`
   - `created_by uuid references profiles(id)`, `created_at timestamptz default now()`

6. **`sessions`** _(Concrete Dated Sessions)_
   - `id uuid primary key default gen_random_uuid()`, `slug text unique not null` _(e.g. `strength-foundations-2026-11-25-0700`)_
   - `session_type_id uuid references session_types(id) on delete set null`
   - `availability_rule_id uuid references session_availability_rules(id) on delete set null`
   - `location_id uuid not null references locations(id)`
   - `title text not null`, `description text not null`, `focus text not null`, `place text not null`
   - `starts_at timestamptz not null`, `ends_at timestamptz not null`, `duration_min int not null`
   - `max_slots int not null check (max_slots > 0)`, `price_eur numeric(8,2) not null`
   - `level text not null`, `equipment text[] not null default '{}'`
   - `status text not null default 'scheduled' check (status in ('scheduled', 'moved_indoor', 'cancelled', 'completed'))`
   - `cancel_reason text`, `cancelled_at timestamptz`, `cancelled_by uuid references profiles(id)`
   - `weather_note text`
   - `created_by uuid references profiles(id)`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`

7. **`bookings`**
   - `id uuid primary key default gen_random_uuid()`
   - `session_id uuid not null references sessions(id) on delete cascade`
   - `user_id uuid not null references profiles(id) on delete cascade` _(account required to book)_
   - `status text not null default 'confirmed' check (status in ('confirmed', 'waitlisted', 'checked_in', 'no_show', 'cancelled', 'rejected'))`
   - `payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid'))` _(simple on-premises Paid/Unpaid toggle)_
   - `paid_at timestamptz`, `marked_paid_by uuid references profiles(id)`
   - `notes text` _(user's booking note / injuries)_
   - `cancel_reason text`, `cancelled_at timestamptz`, `cancelled_by uuid references profiles(id)`
   - `checked_in_at timestamptz`, `booked_at timestamptz not null default now()`, `updated_at timestamptz default now()`
   - **Constraint:** Partial unique index `(session_id, user_id) WHERE status IN ('confirmed', 'waitlisted', 'checked_in')` preventing double-booking.

8. **`private_inquiries`** _(1:1 coaching leads from `/`)_
   - `id uuid primary key default gen_random_uuid()`, `user_id uuid references profiles(id) on delete set null`
   - `name text not null`, `email text not null`, `phone text`, `notes text`
   - `status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'archived'))`
   - `admin_notes text`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`

9. **`coach_client_notes`** _(Strictly admin-only)_
   - `id uuid primary key default gen_random_uuid()`
   - `client_id uuid not null references profiles(id) on delete cascade`
   - `author_id uuid not null references profiles(id)`, `content text not null`, `created_at timestamptz default now()`

10. **`studio_settings`** _(Singleton config row `id = 1`)_
    - `cancellation_window_hours int not null default 12`
    - `whatsapp_number text`, `contact_email text`, `instagram_url text`
    - `studio_hours_en text`, `studio_hours_es text`
    - `banner_message_en text`, `banner_message_es text`, `banner_active boolean default false`

---

### 3.2 History & Audit Tables (Requested + Suggested)

| Table                                           | Purpose                                                                                                                          | Key Columns                                                                                                                                                                                                                                                                                          |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`user_login_history`** _(Requested)_          | Complete record of every user login attempt/event                                                                                | `id`, `user_id`, `email`, `auth_method` (`password`/`magic_link`/`oauth`), `ip_address`, `user_agent`, `success boolean`, `failure_reason`, `logged_in_at timestamptz`                                                                                                                               |
| **`session_history`** _(Requested)_             | Immutable audit trail of every session change (create, edit, max slots, price, location, weather move, cancel + reason)          | `id`, `session_id`, `action` (`created`/`updated`/`moved_indoor`/`cancelled`/`completed`), `actor_id`, `reason`, `previous_state jsonb`, `new_state jsonb`, `created_at timestamptz`                                                                                                                 |
| **`booking_history`** _(Requested)_             | Immutable timeline of every booking status & payment change                                                                      | `id`, `booking_id`, `session_id`, `user_id`, `event_type` (`booked`/`waitlisted`/`promoted`/`checked_in`/`no_show`/`cancelled_by_user`/`cancelled_by_admin`/`rejected`/`marked_paid`/`marked_unpaid`), `actor_id`, `actor_role`, `previous_status`, `new_status`, `reason`, `created_at timestamptz` |
| **`user_moderation_history`** _(Suggested)_     | Tracks every role change (`user → client → admin`) and moderation event (`active → rejected / banned / reinstated`)              | `id`, `target_user_id`, `actor_id`, `event_type` (`role_changed`/`banned`/`rejected`/`reinstated`), `previous_role`, `new_role`, `previous_status`, `new_status`, `reason`, `created_at timestamptz`                                                                                                 |
| **`availability_change_history`** _(Suggested)_ | Audit log of changes to availability rules & date exceptions (explains why a session existed or was blacked out on a given date) | `id`, `rule_id`, `exception_id`, `action`, `actor_id`, `reason`, `snapshot jsonb`, `created_at timestamptz`                                                                                                                                                                                          |
| **`email_notification_logs`** _(Suggested)_     | Audit log of every Resend email dispatched by Edge Functions (essential for troubleshooting delivery)                            | `id`, `recipient_email`, `user_id`, `template_name`, `related_booking_id`, `related_session_id`, `status` (`sent`/`failed`), `resend_id`, `error_message`, `sent_at timestamptz`                                                                                                                     |

---

### 3.3 Atomic RPCs, Triggers & Row Level Security (RLS)

- **Role & Status Enforcement:**
  - `public.is_admin()` (`SECURITY DEFINER`) checks `role = 'admin' AND account_status = 'active'`.
  - `public.is_active_account()` checks `account_status = 'active'` — **all booking & profile-update RLS policies require `is_active_account()`** so banned or rejected users are immediately blocked at the database layer even if they hold an old JWT!
  - `profiles` RLS blocks self-editing `role`, `account_status`, `moderation_reason`, or `moderated_at`.
  - Trigger `handle_new_user()` on `auth.users` creates `profiles` with `role = 'user'`, `account_status = 'active'`, and a unique URL `slug`.
- **Automatic `user → client` Promotion inside `book_session_atomic(...)`:**
  1. Verifies caller is `account_status = 'active'`.
  2. Locks `sessions` row (`SELECT ... FOR UPDATE`), ensures `status IN ('scheduled', 'moved_indoor')` and `starts_at > now()`.
  3. Checks confirmed + checked-in count against `max_slots` → inserts `bookings` row as `'confirmed'` (or `'waitlisted'` if full and waitlist requested).
  4. If `'confirmed'` and user's current `role = 'user'`, atomically updates `profiles.role = 'client'`, sets `first_booked_at = now()`, and logs `role_changed` in `user_moderation_history`.
  5. Inserts initial row into `booking_history`.
- **Atomic Cancellation (`cancel_booking_atomic(...)`):**
  1. Verifies booking owner (`account_status = 'active'`) or `is_admin()`.
  2. Records `cancel_reason`, `cancelled_at = now()`, `cancelled_by = auth.uid()`, sets `status = 'cancelled'` (or `'rejected'` when admin rejects).
  3. Logs transition in `booking_history`.
  4. If a confirmed spot freed up on an upcoming session, returns the earliest `'waitlisted'` user so the Edge Function can promote/notify them.
- **Database Triggers for Automatic Audit History:**
  - `AFTER INSERT OR UPDATE ON sessions` → auto-appends diff snapshot to `session_history`.
  - `AFTER UPDATE ON bookings` (when `status` or `payment_status` changes) → auto-appends to `booking_history`.
- **Public Availability View (`public.sessions_with_availability`):**
  - Exposes session details + `confirmed_count` + `spots_remaining` to `anon` & `authenticated` without exposing any `bookings` PII.

---

### 3.4 Storage Buckets & Policies

| Bucket       | Access      | Upload Rules                                                                                 | Limits                                    |
| :----------- | :---------- | :------------------------------------------------------------------------------------------- | :---------------------------------------- |
| `avatars`    | Public read | Active authenticated users can write/delete only inside `{auth.uid()}/*`; admins full access | Max `2 MB`; `jpeg`, `png`, `webp`         |
| `site-media` | Public read | Admins only (`is_admin()`)                                                                   | Max `5 MB`; `jpeg`, `png`, `webp`, `avif` |

---

## 4. Supabase Edge Functions (with Resend Emails)

| Edge Function           | Caller                                   | Responsibilities                                                                                                                                                                                                                                                             |
| :---------------------- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `log-login`             | Authenticated client right after sign-in | Captures IP, User-Agent, auth method, updates `profiles.last_login_at`, inserts into `user_login_history`, checks `account_status`                                                                                                                                           |
| `book-session`          | Active authenticated user                | Zod-validates input, invokes `book_session_atomic` RPC, sends branded Resend confirmation email (with `.ics` attachment) or waitlist confirmation, writes `email_notification_logs`                                                                                          |
| `cancel-booking`        | Booking owner or Admin                   | Invokes `cancel_booking_atomic` RPC (enforcing 12h policy warning for clients, overrideable by admin), sends cancellation email + promotes/emails next waitlisted user if applicable                                                                                         |
| `cancel-session`        | Admin only                               | Marks session `cancelled` with mandatory `cancel_reason` + `cancelled_at`, cancels all active bookings on that session, emails every affected attendee via Resend                                                                                                            |
| `moderate-user`         | Admin only                               | Handles **Ban**, **Reject**, **Reinstate**, or **Role Change**: updates `profiles`, logs `user_moderation_history`, optionally cancels future bookings for banned/rejected users, calls Supabase Auth Admin API to revoke active tokens on ban, and sends notification email |
| `generate-sessions`     | Admin or Scheduled Cron                  | Reads active `session_availability_rules` (respecting `ongoing` vs `effective_from..effective_until`) + `session_availability_exceptions` (skipping blackouts, applying time/location/slot overrides) and materializes dated `sessions` cleanly without duplicates           |
| `notify-weather-change` | Admin only                               | Marks outdoor session `moved_indoor` (at Eixample Studio) with `weather_note` and emails all confirmed attendees via Resend                                                                                                                                                  |
| `submit-inquiry`        | Public (rate-limited)                    | Validates & saves Private 1:1 inquiry to `private_inquiries` and emails coach Alex                                                                                                                                                                                           |
| `admin-export-csv`      | Admin only                               | Exports filtered bookings, reporting summaries, or audit histories as CSV                                                                                                                                                                                                    |

---

## 5. Step-by-Step Implementation Roadmap

### Phase 0: Supabase Setup, SDKs, Toast Position & Environment Wiring

- [x] Create Supabase project (EU region for Barcelona/GDPR) and Resend account (verify sending domain or use Resend test sender for dev)
- [x] Configure `.env.local`, `.env.example`, Vercel Env Vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), and Supabase Edge Function Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`)
- [x] Install `@supabase/supabase-js`
- [x] Update `<Toaster position="top-left" />` in `src/routes/__root.tsx` (switching from `bottom-right` to **`top-left`** per UX requirement)
- [x] Create `src/lib/supabase.ts` (typed browser client) and `src/hooks/use-auth.tsx` (`AuthProvider`, `useAuth()` exposing `user`, `profile`, `role`, `accountStatus`, `isAdmin`, `isRestricted`, `signOut`)
- [x] Wire `AuthProvider` into `src/routes/__root.tsx` and update `src/router.tsx` context

### Phase 1: Database Schema, Availability Engine, Audit Tables, RPCs & RLS

- [x] Create all 10 core tables (`profiles`, `locations`, `session_types`, `session_availability_rules`, `session_availability_exceptions`, `sessions`, `bookings`, `private_inquiries`, `coach_client_notes`, `studio_settings`)
- [x] Create all 6 history/audit tables (`user_login_history`, `session_history`, `booking_history`, `user_moderation_history`, `availability_change_history`, `email_notification_logs`)
- [x] Implement `is_admin()`, `is_active_account()`, `handle_new_user()`, `book_session_atomic()`, `cancel_booking_atomic()`, and automatic `session_history` / `booking_history` triggers
- [x] Create `public.sessions_with_availability` view and enable strict RLS policies on every table (verified zero PII leakage & zero self-role-escalation)
- [x] Seed Barcelona `locations`, `session_types`, ongoing `session_availability_rules` (the 15 weekly classes), initial 4 weeks of dated `sessions`, and default `studio_settings`
- [x] Generate TypeScript DB types into `src/types/database.ts` _(coach account promotion to `role = 'admin'` ready once coach registers in Phase 2)_

### Phase 2: Auth, RBAC Route Guards & General User Pages

- [x] Configure Supabase Auth Site URL & Redirect URLs (`/auth/callback`, `/reset-password`) _(redirect URLs wired dynamically via `window.location.origin`; also confirm Site URL & Redirect URLs in Supabase Dashboard → Auth → URL Configuration)_
- [x] Build `src/lib/auth-guards.ts` (`requireActiveUser`, `requireAdmin`, `redirectIfAuthenticated`) redirecting `banned`/`rejected` users automatically to `/account-restricted`
- [x] Build slug-first General User pages adhering strictly to the Branding Guide:
  - [x] `/signup` (`src/routes/signup.tsx`) — creates `'user'` account, honors `?redirect=`
  - [x] `/login` (`src/routes/login.tsx`) — logs login to `user_login_history` via `log-login` Edge Function (with `last_login_at` fallback), routes admins to `/admin` and users/clients to `?redirect` or `/client`
  - [x] `/logout` (`src/routes/logout.tsx`) — signs out cleanly, clears caches, shows `top-left` toast, redirects to `/`
  - [x] `/forgot-password`, `/reset-password`, `/auth/callback`
  - [x] `/profile` (`src/routes/profile.tsx`) — edit personal info, WhatsApp, `EN/ES`, injuries/goals, emergency contact, change password, view recent logins
  - [x] `/account-restricted` & `/unauthorized`
- [x] Upgrade `src/components/site/Header.tsx` with logged-out (`Log in` / `Sign up`) vs. logged-in avatar menu (`Dashboard`, `My Bookings`, `Profile`, `Log out`, or `Admin Portal` for coach)

### Phase 3: Media Storage Buckets & Uploads

- [ ] Provision `avatars` and `site-media` Supabase Storage buckets with MIME/size caps and Storage RLS policies
- [ ] Build `src/lib/storage.ts` (validated upload, replace, delete, public URL helpers)
- [ ] Wire avatar uploader into `/profile`

### Phase 4: Edge Functions (Resend) & Live Public Site Integration

- [ ] Implement and deploy Edge Functions: `log-login`, `book-session`, `cancel-booking`, `submit-inquiry`, `generate-sessions`
- [ ] Build reusable dark-themed Resend HTML email templates (booking confirmed + `.ics`, waitlist joined/promoted, booking cancelled/rejected, session cancelled/weather moved, 1:1 inquiry alert, account moderation notice)
- [ ] Replace static `INITIAL_SESSIONS` and `localStorage` `useBookings` with TanStack Query hooks + Supabase Realtime live spot updates
- [ ] Build dedicated public session page `/sessions/$slug` (`src/routes/sessions/$slug.tsx`) linked from `/` schedule rows
- [ ] Update booking flow on `/` and `/sessions/$slug`:
  - Unauthenticated users clicking `Book` redirect cleanly to `/signup?redirect=/sessions/$slug` (with quick switch to `/login`)
  - Authenticated active users confirm in 1 click (with optional booking notes), automatically upgrading `'user'` → `'client'` on first booking, receiving a `top-left` toast + Resend email with `.ics`

### Phase 5: Client Portal (`/client/*`)

- [ ] Create Client portal layout (`src/routes/client.tsx`) with branded `Sidebar` (`Dashboard`, `My Bookings`, `Profile`, `Book a Session (/)`, `Log out`)
- [ ] Build `/client` (`src/routes/client/index.tsx`): next session hero card, consistency stats, gentle prompt for `'user'` accounts to book their first session, quick-book upcoming open classes
- [ ] Build `/client/bookings` (`src/routes/client/bookings.tsx`): tabs for **Upcoming**, **Waitlist**, **Past & Cancelled** linking to `/client/bookings/$bookingId`
- [ ] Build `/client/bookings/$bookingId` (`src/routes/client/bookings/$bookingId.tsx`): full session details, `Pay on premises` / `Paid` badge, meeting point + Maps link, `.ics` / Google Calendar buttons, booking status timeline, and **Cancel Booking** `AlertDialog` (optional reason + 12h policy reminder)

### Phase 6: Admin Portal — Core Operations & Availability Calendar

- [ ] Create Admin portal layout (`src/routes/admin.tsx`) guarded by `requireAdmin` using shadcn `Sidebar`
- [ ] Build `/admin` (`src/routes/admin/index.tsx`): today's roster with 1-click **Check-In** and **Paid/Unpaid** toggles, weekly fill-rate KPIs, waitlist count, unread 1:1 inquiries, quick actions
- [ ] Build Session Types pages (`/admin/session-types`, `/admin/session-types/new`, `/admin/session-types/$slug`)
- [ ] Build Sessions pages (`/admin/sessions`, `/admin/sessions/new`, `/admin/sessions/$slug`): full CRUD, attendee roster management, **Session History** timeline, **Weather Move** modal (`notify-weather-change`), and **Cancel Session** `AlertDialog` (mandatory `cancel_reason` + `cancelled_at` → `cancel-session` Edge Function)
- [ ] Build Calendar Availability Manager (`/admin/availability`):
  - Create/edit recurring rules as **Ongoing** (`effective_until = null`) or **Specific Date Period** (`effective_from` → `effective_until`)
  - Create/edit **Exceptions** (blackout dates, holidays, time/location/slot overrides)
  - Visual monthly/weekly calendar preview + **"Generate Upcoming Sessions"** button (`generate-sessions` Edge Function)
- [ ] Build Bookings pages (`/admin/bookings`, `/admin/bookings/$bookingId`): filters, **Paid / Unpaid** toggle, Check-In / No-Show, Reject/Cancel `AlertDialog` (with reason), Promote from waitlist, manual booking, full `booking_history` timeline

### Phase 7: Admin Portal — Clients, Moderation, Inquiries, Reporting, Media & Settings

- [ ] Build Users & Clients pages (`/admin/clients`, `/admin/clients/$userId`):
  - Filter by role (`user`, `client`, `admin`) and status (`active`, `rejected`, `banned`)
  - Detail page with role editor, **Reject User** & **Ban User** / **Reinstate** `AlertDialog`s (mandatory reason → `moderate-user` Edge Function), **Login History**, **Booking History**, **Moderation History**, and private coach notes
- [ ] Build Inquiries pages (`/admin/inquiries`, `/admin/inquiries/$inquiryId`)
- [ ] Build Reporting & Audit Explorer (`/admin/reporting`) with `recharts`:
  - Occupancy %, paid on-premises revenue, cancellation/no-show breakdown + top cancel reasons, `user → client` conversion funnel, Studio vs Outdoor demand, busiest slots
  - Audit Log tabs (`Login History`, `Session History`, `Booking History`, `Email Logs`) + CSV export (`admin-export-csv`)
- [ ] Build Media Manager (`/admin/media`) for `site-media` bucket and Settings (`/admin/settings`) for studio hours, WhatsApp, 12h policy, locations CRUD, and weather/announcement banner

### Phase 8: Testing, RLS Security Audit, Observability & Production Launch

- [ ] **RLS & Moderation Penetration Checks:**
  - Verify `anon` cannot read any PII (`profiles`, `bookings`, `user_login_history`, `private_inquiries`, `coach_client_notes`)
  - Verify `user`/`client` cannot read other users' records, cannot self-escalate `role` or `account_status`, and cannot call admin Edge Functions
  - Verify `banned` and `rejected` users are immediately blocked from booking and redirected to `/account-restricted`
  - Verify `user → client` auto-promotion happens atomically on first confirmed booking and logs to `user_moderation_history`
  - Verify concurrent last-spot booking test (2 simultaneous requests → 1 confirmed, 1 waitlisted/rejected)
- [ ] **Automated Tests:** Unit & component tests for auth guards, slug pages, availability rule generation + exceptions, cancel reason validation, and `top-left` toasts
- [ ] **Observability & SEO Hygiene:**
  - Attach `Sentry.setUser({ id: user.id })` on sign-in and clear on sign-out; report Edge Function errors cleanly
  - Add `Disallow: /admin`, `Disallow: /client`, `Disallow: /profile`, `Disallow: /auth` to `public/robots.txt` and `noindex, nofollow` meta tags on all private portal routes
- [ ] **Production Verification:** Run `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, deploy to Vercel, and run full E2E smoke test on `https://alex-moreno-barcelona-bd58.vercel.app/`

---

## 6. Suggested GitHub Milestones (per `GITHUB_ISSUES_GUIDE.md`)

1. **`M2: Supabase Foundation, Schema & Auth`** — Phases 0, 1, 2, 3 (DB + History tables + RLS + Auth + General pages + Storage + `top-left` toasts)
2. **`M3: Booking Engine, Emails & Client Portal`** — Phases 4, 5 (Edge Functions + Resend + `/sessions/$slug` + Live `/` + `/client/*`)
3. **`M4: Coach Admin Portal, Availability & Moderation`** — Phase 6 (Admin Dashboard, Sessions, Session Types, Availability Rules/Exceptions, Bookings, Paid/Unpaid)
4. **`M5: CRM, Reporting, Audit Logs & Launch`** — Phases 7, 8 (Clients + Ban/Reject, Inquiries, `recharts` Reporting, Media, Settings, RLS Audit & Prod Deploy)

---

## 7. Future Improvements (Explicitly Deferred)

- **Online Payments (Stripe):** Stripe Checkout / Payment Intents + webhooks for online drop-in payments, multi-session packs, and recurring monthly memberships.
- **Automated Reminders:** Scheduled Edge Function sending 24h / 2h pre-session WhatsApp or email reminders.
- **Client Progress Tracking:** Coach-logged PRs (deadlift/squat/press) and milestone charts inside `/client/progress`.
