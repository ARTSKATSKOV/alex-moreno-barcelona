# Sentry Setup Guide (Short & On Point)

Quick checklist to set up **Sentry** for error reporting and user feedback on **Alex Moreno — Barcelona** (React + TanStack Start + Vite on Vercel).

---

## 1. Create Your Sentry Account & Project

1. Go to [sentry.io](https://sentry.io) and sign up (GitHub login is fastest).
2. Choose **EU** as your data region (recommended for Spain/Barcelona GDPR compliance).
3. Click **Create Project**:
   - **Platform:** `React`
   - **Project name:** `alex-moreno-barcelona`
   - **Alert frequency:** _On every new issue_ (good while traffic is low)

---

## 2. Grab Your DSN (Public Key)

After creating the project, Sentry shows a setup snippet with a `dsn` URL that looks like:

```text
https://<public-key>@o<org-id>.ingest.de.sentry.io/<project-id>
```

> **Note:** The `DSN` is safe to expose in frontend code (it only allows sending events to your project). Keep **Auth Tokens** private — never commit them to git.

_(You can always find your DSN later under **Project Settings → Client Keys (DSN)**.)_

---

## 3. Add `VITE_SENTRY_DSN` to Local & Vercel

### Local (`.env.local` — gitignored)

Create `.env.local` in the project root:

```env
VITE_SENTRY_DSN=https://<your-dsn-here>
```

### Vercel Dashboard

1. Open your Vercel project (`alex-moreno-barcelona-bd58`) → **Settings → Environment Variables**.
2. Add:
   - **Key:** `VITE_SENTRY_DSN`
   - **Value:** your DSN URL
   - **Environments:** Production, Preview, Development
3. Save (it will apply on the next deploy).

---

## 4. Enable User Feedback & (Optional) Source Maps

- **User Feedback:** Built into `@sentry/react` via `Sentry.feedbackIntegration()` — no extra dashboard setup required. Feedback reports appear under **User Feedback** in Sentry.
- **GitHub Integration (recommended):** In Sentry, go to **Settings → Integrations → GitHub** and connect `ARTSKATSKOV/alex-moreno-barcelona` so Sentry issues can link directly to GitHub issues and commits.
- **Source Maps (optional, later):** If you want readable TypeScript stack traces in production, create a Sentry Auth Token (**Settings → Auth Tokens**) and add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` to Vercel Environment Variables.

---

## 5. Next Step (Hand Off to Your AI Dev Agent)

Once steps 1–3 are done, reply in chat:

> _"Sentry project is created and `VITE_SENTRY_DSN` is set in `.env.local` and Vercel — wire up `@sentry/react` + ErrorBoundary + User Feedback for Issue #1."_

The agent will install `@sentry/react`, hook it into `src/routes/__root.tsx`, and give you a quick test trigger to confirm events land in your Sentry dashboard.
