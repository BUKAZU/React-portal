/**
 * Website entry point for the Bukazu Portal.
 *
 * This module is compiled into a self-contained IIFE bundle (`portal.website.js`)
 * that includes React and all other dependencies.  Drop it into any HTML page
 * together with the companion CSS file and it will automatically mount a Portal
 * on every element that carries the `bukazu-app` class.
 *
 * Attribute API (set on the host element):
 *   portal-code  – required  – portal identifier (empty string shows an error state)
 *   object-code  – optional  – object/property identifier (omit for search)
 *   page         – optional  – page type override
 *   language     – optional  – locale: en | nl | de | fr | es | it (default: en)
 *   filters      – optional  – JSON-encoded filters object; invalid JSON is silently
 *                              ignored and an empty object is used instead
 *
 * Example:
 *   <div class="bukazu-app"
 *        portal-code="YOUR_PORTAL_CODE"
 *        object-code="YOUR_OBJECT_CODE"
 *        language="en">
 *   </div>
 *   <link  rel="stylesheet" href="portal.website.css">
 *   <script src="portal.website.js"></script>
 *
 * For advanced usage, the `init` and `mountPortal` functions are also exposed
 * on the `BukazuPortal` global so you can call them manually from your own
 * scripts (e.g. after dynamically inserting a host element):
 *   BukazuPortal.mountPortal(document.querySelector('.my-portal'));
 */

import React from 'react';
import { createRoot, Root } from 'react-dom/client';

import Portal from './index';
import { LocaleType } from './types';
import { FiltersType } from './components/SearchPage/filters/filter_types';

const CLASS_NAME = 'bukazu-app';

/** Cache of already-created React roots, keyed by host element. */
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
 * Mount a Portal onto a single host element.
 *
 * - `portal-code`: passed through as-is; when absent, the Portal component
 *   itself renders an error message.
 * - `language`: falls back to `'en'` when absent or unrecognised.
 * - `filters`:  falls back to `{}` when absent or invalid JSON.
 */
function mountPortal(element: HTMLElement): void {
  const portalCode = element.getAttribute('portal-code') ?? '';
  const objectCode = element.getAttribute('object-code') ?? '';
  const pageType = element.getAttribute('page') ?? undefined;
  const rawLocale = element.getAttribute('language');
  const locale: LocaleType =
    rawLocale && isLocaleType(rawLocale) ? rawLocale : 'en';
  const filters = parseFilters(element.getAttribute('filters'));

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
    />
  );
}

/** Mount Portals on all `.bukazu-app` elements present in the document. */
function init(): void {
  const elements = document.getElementsByClassName(CLASS_NAME);
  for (const element of Array.from(elements)) {
    mountPortal(element as HTMLElement);
  }
}

function isLocaleType(value: string): value is LocaleType {
  return ['nl', 'en', 'de', 'es', 'fr', 'it'].includes(value);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export { init, mountPortal };
