/**
 * Website entry point for the Bukazu Portal.
 *
 * This module is compiled into a self-contained IIFE bundle (`portal.website.js`)
 * that includes React, all other dependencies, and the stylesheet.  Drop it into
 * any HTML page and it will automatically mount a Portal on every element that
 * carries the `bukazu-app` class.  When no such element exists it falls back to
 * `#bukazu-app`, which is what older embed snippets use.
 *
 * Attribute API (set on the host element):
 *   portal-code  – required  – portal identifier (empty string shows an error state)
 *   object-code  – optional  – object/property identifier (omit for search)
 *   page         – optional  – page type override
 *   language     – optional  – locale, either a bare code (`nl`) or a full BCP-47
 *                              tag (`nl-NL`); unsupported languages fall back to
 *                              English
 *   filters      – optional  – JSON-encoded filters object; invalid JSON is silently
 *                              ignored and an empty object is used instead
 *   sentry-dsn   – optional  – Sentry DSN for error reporting; defaults to the DSN
 *                              baked into the bundle at build time. Pass `off` (or
 *                              `none`) to disable reporting entirely.
 *
 * Example:
 *   <div class="bukazu-app"
 *        portal-code="YOUR_PORTAL_CODE"
 *        object-code="YOUR_OBJECT_CODE"
 *        language="en">
 *   </div>
 *   <script src="portal.website.js"></script>
 *
 * The bundle injects its own `<style>` element, so no stylesheet link is needed.
 * Embedders whose Content-Security-Policy forbids inline styles can instead load
 * the companion `portal.website.css` through a `<link>` tag.
 *
 * For advanced usage, the `init` and `mountPortal` functions are also exposed
 * on the `BukazuPortal` global so you can call them manually from your own
 * scripts (e.g. after dynamically inserting a host element):
 *   BukazuPortal.mountPortal(document.querySelector('.my-portal'));
 */

import React from 'react';
import { createRoot, Root } from 'react-dom/client';

import Portal from './index';
import { FiltersType } from './components/SearchPage/filters/filter_types';

const CLASS_NAME = 'bukazu-app';
const ELEMENT_ID = 'bukazu-app';

/** Attribute values that turn Sentry reporting off for a host element. */
const SENTRY_OFF_VALUES = ['off', 'none'];

/**
 * The public surface a loaded copy of this bundle offers to later copies.
 */
interface PortalRuntime {
  version: string;
  init(): void;
  mountPortal(element: HTMLElement): void;
}

/**
 * The first copy of the bundle to run on a page registers itself here and
 * becomes the owner of every portal on that page. A page can end up with the
 * bundle loaded more than once — a hand-placed `<script>` next to the one a CMS
 * plugin enqueues, or a cached inline copy alongside the CDN copy — and each
 * copy carries its own React. React roots are bound to the react-dom instance
 * that created them, so a second copy rendering into the first copy's root
 * mixes two Reacts and crashes with "Cannot read properties of null (reading
 * 'useEffect')". Later copies therefore never mount anything themselves: their
 * `init`/`mountPortal` forward to the owner, and they skip the boot sequence.
 */
const globalScope = globalThis as typeof globalThis & {
  __bukazuPortal__?: PortalRuntime;
};

/**
 * React roots created by this copy of the bundle, keyed by host element, so
 * mounting the same element twice re-renders instead of calling `createRoot`
 * again. Module-local on purpose: see `PortalRuntime`.
 */
const roots = new WeakMap<HTMLElement, Root>();

/**
 * Parse the `filters` HTML attribute.
 * Returns an empty object when the attribute is absent, contains invalid JSON,
 * or the parsed value is not a plain object (e.g. arrays, null, numbers).
 */
function parseFilters(raw: string | null): FiltersType {
  if (!raw) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return parsed as FiltersType;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Resolves the Sentry DSN for a host element.
 *
 * The `sentry-dsn` attribute wins when set to a non-empty value other than the
 * opt-out keywords; otherwise the DSN baked into the bundle at build time is
 * used. `undefined` leaves Sentry uninitialised, which the Portal component
 * treats as "report nothing".
 */
function resolveSentryDsn(element: HTMLElement): string | undefined {
  const raw = element.getAttribute('sentry-dsn');
  if (raw !== null && SENTRY_OFF_VALUES.includes(raw)) {
    return undefined;
  }
  return raw || __SENTRY_DSN__ || undefined;
}

/**
 * Mount a Portal onto a single host element.
 *
 * - `portal-code`: passed through as-is; when absent, the Portal component
 *   itself renders an error message.
 * - `language`: passed through as-is; the Portal component normalises BCP-47
 *   tags and falls back to `'en'` for anything unsupported.
 * - `filters`:  falls back to `{}` when absent or invalid JSON.
 * - `sentry-dsn`: see `resolveSentryDsn`.
 */
function mountPortalHere(element: HTMLElement): void {
  const portalCode = element.getAttribute('portal-code') ?? '';
  const objectCode = element.getAttribute('object-code') ?? '';
  const pageType = element.getAttribute('page') ?? undefined;
  const locale = element.getAttribute('language') ?? undefined;
  const filters = parseFilters(element.getAttribute('filters'));
  const sentryDsn = resolveSentryDsn(element);

  let root = roots.get(element);
  if (!root) {
    root = createRoot(element);
    roots.set(element, root);
  }
  root.render(
    <Portal
      portalCode={portalCode}
      objectCode={objectCode}
      pageType={pageType}
      locale={locale}
      filters={filters}
      sentryDsn={sentryDsn}
    />
  );
}

/**
 * Mount Portals on every `.bukazu-app` element present in the document.
 *
 * When the page carries no such element, `#bukazu-app` is used instead: older
 * embed snippets identify their host by id only. The fallback deliberately does
 * not run when class-based hosts exist, so a page cannot gain an extra mount.
 */
function initHere(): void {
  const elements = Array.from(
    document.getElementsByClassName(CLASS_NAME)
  ) as HTMLElement[];

  if (elements.length === 0) {
    const byId = document.getElementById(ELEMENT_ID);
    if (byId) {
      elements.push(byId);
    }
  }

  for (const element of elements) {
    mountPortalHere(element);
  }
}

/** Version of the package this bundle was built from. */
const version = __PORTAL_VERSION__;

const owner: PortalRuntime | undefined = globalScope.__bukazuPortal__;
const runtime: PortalRuntime = owner ?? {
  version,
  init: initHere,
  mountPortal: mountPortalHere
};

/**
 * Mount Portals on every `.bukazu-app` element present in the document.
 * Forwards to the copy of the bundle that owns the page's portals.
 */
function init(): void {
  runtime.init();
}

/**
 * Mount a Portal onto a single host element.
 * Forwards to the copy of the bundle that owns the page's portals.
 */
function mountPortal(element: HTMLElement): void {
  runtime.mountPortal(element);
}

if (!owner) {
  globalScope.__bukazuPortal__ = runtime;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
}

export { init, mountPortal, version };
