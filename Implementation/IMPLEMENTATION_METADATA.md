# Metadata & Social Preview Implementation Plan — Alex Moreno (Barcelona)

> **Goal:** Replace default Lovable link previews with a crisp `1200×630` snapshot of our actual website and ship complete, production-grade SEO, Open Graph, Twitter/X, Structured Data (JSON-LD), favicon/manifest, and crawler metadata.
> **Scope:** Frontend / static assets & TanStack Router `head()` configuration only (no backend required).

---

## Progress Overview

- [x] **Phase 1:** Website Snapshot & Brand Icon Assets (`public/`)
- [x] **Phase 2:** Centralized Metadata & Site URL Config (`src/data/metadata.ts`)
- [x] **Phase 3:** Root & Home Route Head Tags (`__root.tsx`, `index.tsx`)
- [x] **Phase 4:** Structured Data (JSON-LD Schema.org for Local Business & FAQ)
- [x] **Phase 5:** Crawlability (`robots.txt`, `sitemap.xml`, `site.webmanifest`)
- [x] **Phase 6:** Verification, Automated Tests & Social Debugger Checklist

---

## Why Lovable Previews Currently Appear

1. **Relative `og:image` path:** `src/routes/index.tsx` currently passes a Vite-hashed relative asset path (`/assets/hero-....jpg`). Social crawlers (WhatsApp, LinkedIn, X, Slack, iMessage, Facebook) require an **absolute `https://` URL** with explicit width/height (`1200×630`); otherwise they ignore it or fall back to platform-level defaults.
2. **No branded `1200×630` website snapshot:** Using raw hero photography doesn't showcase the brand headline, Barcelona positioning, or live site aesthetic in link cards.
3. **Missing canonical, manifest, and structured data:** There is no `rel="canonical"`, `og:url`, `og:site_name`, `og:locale`, `site.webmanifest`, `sitemap.xml`, or JSON-LD local business markup.
4. _(Platform note)_ If the site is also published via Lovable Cloud/Hosting, make sure any cached share preview in Lovable's **Publish / Project Settings** is refreshed after deploying these tags.

---

## Phase 1: Website Snapshot & Brand Icon Assets (`public/`)

Capture a real, pixel-crisp `1200×630` snapshot of the live website and replace generic boilerplate icons with branded assets.

- [x] Start the local app and capture a clean `1200×630` screenshot of the above-the-fold Hero + Header (`Alex Moreno.`, headline _"Get stronger. Stay consistent. In under an hour."_, Barceloneta backdrop, and _"Next available"_ card) via the built-in browser at `1200×630` viewport
- [x] Save the snapshot to `public/og-image.png` (stable, unhashed path `/og-image.png` so social crawlers and external links never break across builds)
- [x] Verify `public/og-image.png` dimensions (`1200×630`, 1.91:1 aspect ratio) and file size (clean cropped PNG)
- [x] Create a crisp branded vector favicon `public/favicon.svg` (dark charcoal tile `#171514` with bold condensed `AM.` in cream + warm amber accent `#eb7a2e`)
- [x] Generate/save `public/apple-touch-icon.png` (`180×180`) for iOS home-screen bookmarks and clean mobile link previews
- [x] Confirm `public/favicon.ico` is updated or paired cleanly with `favicon.svg`

---

## Phase 2: Centralized Metadata & Site URL Config (`src/data/metadata.ts`)

Keep all URLs, titles, descriptions, social handles, and structured data builders in one typed module so there are zero hardcoded or mismatched strings across routes.

- [x] Create `src/data/metadata.ts` with:
  - `SITE_URL`: reads `import.meta.env.VITE_SITE_URL` (trimmed of trailing slash) with a clean production default (e.g. `https://alexmoreno.fit`, easy to override per environment/custom domain)
  - `absoluteUrl(path: string)` helper that always resolves `/og-image.png` → `https://<domain>/og-image.png`
  - Brand & SEO constants:
    - `siteName`: `"Alex Moreno — Strength & Conditioning"`
    - `defaultTitle`: `"Alex Moreno — Strength & Conditioning, Barcelona"`
    - `homeTitle`: `"Alex Moreno — Book Strength Sessions in Barcelona"`
    - `description`: concise ~150-character summary highlighting Eixample studio, outdoor Barcelona locations, small-group & 1:1 sessions, and instant booking
    - `keywords`: focused local SEO keywords (Barcelona strength coaching, Eixample studio, outdoor fitness Barceloneta/Ciutadella/Montjuïc/Poblenou, small-group personal training)
    - `ogImage`: `{ url: absoluteUrl("/og-image.png"), width: 1200, height: 630, type: "image/png", alt: "Alex Moreno Strength & Conditioning Barcelona — Hero & Live Schedule Preview" }`
    - `social`: `{ instagram: "@alexmoreno.fit", twitterHandle: "@alexmorenofit" }` (zero `@Lovable` references)
    - `themeColor`: `"#171514"` (matches `--background` oklch dark charcoal)
- [x] Add a helper `buildHomeMetadata()` returning the complete `meta` and `links` arrays for `/`

---

## Phase 3: Root & Home Route Head Tags (`src/routes/__root.tsx`, `src/routes/index.tsx`)

Follow TanStack Router best practices: shared document defaults, icons, and manifest live in `__root.tsx`; page-specific Open Graph, Twitter Card, canonical URL, and `og:image` live in `index.tsx` so future subpages don't accidentally inherit `/` previews.

### 3.1 Root Route (`src/routes/__root.tsx`)

- [x] Add core browser & mobile meta tags:
  - `theme-color` (`#171514`)
  - `color-scheme` (`dark`)
  - `robots` (`index, follow, max-image-preview:large, max-snippet:-1`)
  - `application-name` (`Alex Moreno`)
  - `apple-mobile-web-app-title` (`Alex Moreno`)
  - `format-detection` (`telephone=no`)
- [x] Add complete icon & manifest `<link>` tags:
  - `rel="icon"` for `/favicon.svg` (`type="image/svg+xml"`) + `/favicon.ico` fallback
  - `rel="apple-touch-icon"` (`sizes="180x180"`, `href="/apple-touch-icon.png"`)
  - `rel="manifest"` (`href="/site.webmanifest"`)
- [x] Audit `__root.tsx` to ensure zero leftover Lovable meta tags or placeholder comments remain

### 3.2 Home Route (`src/routes/index.tsx`)

- [x] Wire `buildHomeMetadata()` into `Route.head()`:
  - **Core SEO:** `title`, `description`, `keywords`, `author`
  - **Canonical & Language links:** `<link rel="canonical" href="https://..." />`, `<link rel="alternate" hrefLang="en" ... />`, `<link rel="alternate" hrefLang="es" ... />`, `<link rel="alternate" hrefLang="x-default" ... />`
  - **Open Graph (WhatsApp, LinkedIn, Facebook, Slack, Discord, iMessage):**
    - `og:type` (`website`)
    - `og:site_name`
    - `og:url` (absolute canonical URL)
    - `og:title` & `og:description`
    - `og:locale` (`en_GB`) & `og:locale:alternate` (`es_ES`)
    - `og:image` (absolute `https://.../og-image.png`)
    - `og:image:secure_url`
    - `og:image:type` (`image/png`)
    - `og:image:width` (`1200`) & `og:image:height` (`630`)
    - `og:image:alt`
  - **Twitter / X Cards:**
    - `twitter:card` (`summary_large_image`)
    - `twitter:url` (absolute URL)
    - `twitter:title` & `twitter:description`
    - `twitter:image` (absolute `https://.../og-image.png`)
    - `twitter:image:alt`
    - `twitter:creator` & `twitter:site`

---

## Phase 4: Structured Data (JSON-LD Schema.org)

Give Google Search and AI/local search engines rich, machine-readable facts about Alex Moreno's coaching business in Barcelona.

- [x] Create JSON-LD builders in `src/data/metadata.ts`:
  - **`SportsActivityLocation` / `LocalBusiness` schema:**
    - Name, description, absolute URL, absolute `image` (`/og-image.png`)
    - Address (`Eixample`, `Barcelona`, `08011`, `ES`) and geo area served (`Barcelona`)
    - Opening hours (`Mo-Fr 07:00-20:30`, `Sa-Su 09:00-12:00`)
    - Price range (`€15–€190`) & `EUR` currency
    - Contact point (email / WhatsApp) and `sameAs` (`https://instagram.com/alexmoreno.fit`)
    - Offered services (`Small-Group Strength & Conditioning`, `Private 1:1 Coaching`)
  - **`FAQPage` schema:** auto-generated from `FAQ_ITEMS` in `src/data/site.ts` so FAQ answers stay in sync automatically
- [x] Inject the JSON-LD `<script type="application/ld+json">` cleanly via TanStack Router's `head().scripts` on `/` (ensuring it renders in SSR HTML for crawlers!)

---

## Phase 5: Crawlability & Web Manifest (`public/`)

- [x] Create `public/site.webmanifest`:
  - `name`: `"Alex Moreno — Strength & Conditioning, Barcelona"`
  - `short_name`: `"Alex Moreno"`
  - `start_url`: `"/"`
  - `display`: `"standalone"`
  - `background_color`: `"#171514"`
  - `theme_color`: `"#171514"`
  - `icons` referencing `/favicon.svg` and `/apple-touch-icon.png`
- [x] Create `public/sitemap.xml` listing the canonical homepage URL with `<lastmod>`, `<changefreq>weekly</changefreq>`, and `<priority>1.0</priority>`
- [x] Update `public/robots.txt` to include `Sitemap: https://<domain>/sitemap.xml` while keeping crawler access open for `Googlebot`, `Bingbot`, `Twitterbot`, `facebookexternalhit`, `WhatsApp`, and `*`

---

## Phase 6: Verification, Automated Tests & Social Debugger Checklist

- [x] Add `src/data/metadata.test.ts` verifying:
  - All `og:image`, `og:url`, `twitter:image`, and `canonical` URLs are valid absolute `https://` URLs
  - `og:image:width` (`1200`) and `og:image:height` (`630`) are present
  - Zero occurrences of `"lovable"` (case-insensitive) across generated meta tags and JSON-LD
  - JSON-LD parses cleanly and includes both `SportsActivityLocation` and `FAQPage` items matching `FAQ_ITEMS`
- [x] Inspect rendered `<head>` HTML from the local server / SSR build to verify all meta tags, canonical link, icons, and JSON-LD scripts appear in the initial HTML response (not just client-side)
- [x] Run `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build` with zero errors
- [ ] _(Post-deploy)_ Validate the live production URL in:
  - OpenGraph debugger (opengraph.xyz / Meta Sharing Debugger)
  - X / Twitter Card validator
  - LinkedIn Post Inspector
  - WhatsApp / iMessage paste test (and clear cache if previously shared)
