/**
 * Thin wrappers around @sentry/browser's standalone capture functions.
 *
 * These helpers intentionally do **not** call `Sentry.init()`. They rely on
 * the consuming application having already initialised Sentry with the
 * project DSN before the portal is rendered. If Sentry is not initialised in
 * the host application the calls become silent no-ops, which is safe.
 */
import { captureException, captureMessage } from '@sentry/browser';

/**
 * Reports an Error object to Sentry.
 * Only call this when the error is actually displayed to the user — do not
 * use the global Sentry integration for automatic capturing.
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
