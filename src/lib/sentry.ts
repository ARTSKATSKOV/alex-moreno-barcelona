import * as Sentry from "@sentry/react";

const DEFAULT_SENTRY_DSN =
  "https://a01f9bdff5994d0d6970534d8c768821@o4512470322774016.ingest.de.sentry.io/4512470342697040";

let initialized = false;

export function initSentry(): void {
  if (initialized || typeof window === "undefined" || import.meta.env.MODE === "test") return;

  const envDsn = import.meta.env.VITE_SENTRY_DSN;
  const dsn = (envDsn && envDsn.trim()) || DEFAULT_SENTRY_DSN;
  if (!dsn) return;

  const isDev = Boolean(import.meta.env.DEV);

  Sentry.init({
    dsn: dsn.trim(),
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      Sentry.feedbackIntegration({
        colorScheme: "dark",
        autoInject: true,
      }),
    ],
    // Sample 100% locally for verification; start at 10% in production.
    tracesSampleRate: isDev ? 1.0 : 0.1,
    replaysSessionSampleRate: isDev ? 1.0 : 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  initialized = true;
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export function setSentryUser(user: { id: string } | null): void {
  if (typeof window === "undefined") return;
  Sentry.setUser(user ? { id: user.id } : null);
}
