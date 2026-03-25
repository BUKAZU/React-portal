/**
 * Thin wrappers around @sentry/browser's standalone capture functions.
 *
 * Call `initSentry(dsn)` once with your Sentry project DSN so that the
 * portal's errors are routed to your own Sentry project.
 * Call `setSentryContext` whenever the Portal mounts or its key props change
 * so that every subsequent capture automatically includes the current URL,
 * portal code, object code, and locale.
 *
 * If `initSentry` is not called, the portal will silently try to route
 * events to an already-initialised Sentry instance in the host application.
 * If no Sentry instance exists at all, all capture calls are safe no-ops.
 */
import {
  init,
  getClient,
  captureException,
  captureMessage,
  setTag,
  setContext
} from '@sentry/browser';

export interface PortalContext {
  portalCode: string;
  objectCode?: string;
  locale?: string;
}

/**
 * Initialise Sentry with the given DSN.
 * If Sentry has already been initialised (by this call or by the host
 * application), the call is ignored to avoid double-initialisation.
 */
export function initSentry(dsn: string): void {
  if (getClient() !== undefined) return;
  init({ dsn });
}

/**
 * Attach portal context to the Sentry scope so that every subsequent capture
 * includes the current URL, portal code, object code, and locale.
 */
export function setSentryContext(context: PortalContext): void {
  const url =
    typeof window !== 'undefined' ? window.location.href : undefined;

  setTag('portal_code', context.portalCode);
  if (context.objectCode) setTag('object_code', context.objectCode);
  if (context.locale) setTag('locale', context.locale);

  setContext('bukazu', {
    portal_code: context.portalCode,
    object_code: context.objectCode ?? null,
    locale: context.locale ?? null,
    url: url ?? null
  });
}

/**
 * Reports an Error object to Sentry.
 * Only call this when the error is actually displayed to the user.
 */
export function reportError(error: Error): void {
  captureException(error);
}

/**
 * Reports a plain error message string to Sentry.
 * Only call this when the message is actually displayed to the user.
 */
export function reportMessage(message: string): void {
  captureMessage(message, 'error');
}
