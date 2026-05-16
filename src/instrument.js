/**
 * Sentry initialization for jarbris-widget.
 *
 * Mirrors the pattern from jarbris-app (src/instrument.js):
 * - init at import time (before React renders)
 * - no-op if DSN is missing (safe for local dev without .env)
 * - environment tag from Vite mode
 * - release tag for release health tracking
 *
 * Import this file FIRST in main.jsx, before any other app code.
 *
 * The widget runs on third-party merchant stores — errors are invisible
 * without telemetry. This is the ONLY way to detect crashes in production.
 *
 * @module instrument
 */
import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  environment: import.meta.env.MODE, // 'development' | 'production'
  release: import.meta.env.VITE_SENTRY_RELEASE || undefined,

  // Only send errors in production — avoid noise during dev
  beforeSend(event) {
    if (import.meta.env.DEV) return null;
    return event;
  },

  // Sample 100% of errors, 10% of transactions (performance)
  sampleRate: 1.0,
  tracesSampleRate: 0.1,

  integrations: [Sentry.browserTracingIntegration()],
});
