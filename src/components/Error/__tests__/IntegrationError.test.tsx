/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import IntegrationError from '../IntegrationError';

// Required for act() to work correctly in the jsdom test environment
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  jest.restoreAllMocks();
});

function renderError(props: Parameters<typeof IntegrationError>[0]) {
  const result = IntegrationError(props);
  act(() => {
    root.render(result || <></>);
  });
  return result;
}

describe('IntegrationError', () => {
  it('returns false when all props are valid', () => {
    const result = renderError({ portalCode: 'abc123', locale: 'en' });
    expect(result).toBe(false);
  });

  it('shows an error when portalCode is missing', () => {
    renderError({ portalCode: '', locale: 'en' });
    expect(container.querySelector('h2')).not.toBeNull();
    expect(container.textContent).toContain('No portal code');
  });

  it('shows an error for an invalid pageType', () => {
    renderError({ portalCode: 'abc123', pageType: 'invalid-page', locale: 'en' });
    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('does NOT show an error for pageType "reviews"', () => {
    const result = renderError({ portalCode: 'abc123', pageType: 'reviews', locale: 'en' });
    expect(result).toBe(false);
  });

  it('does NOT show an error for BCP-47 locale "en-US"', () => {
    const result = renderError({ portalCode: 'abc123', locale: 'en-US' });
    expect(result).toBe(false);
  });

  it('does NOT show an error for BCP-47 locale "nl-NL"', () => {
    const result = renderError({ portalCode: 'abc123', locale: 'nl-NL' });
    expect(result).toBe(false);
  });

  it('does NOT show an error for BCP-47 locale "de-DE"', () => {
    const result = renderError({ portalCode: 'abc123', locale: 'de-DE' });
    expect(result).toBe(false);
  });

  it('does NOT show an error for BCP-47 locale "fr-FR"', () => {
    const result = renderError({ portalCode: 'abc123', locale: 'fr-FR' });
    expect(result).toBe(false);
  });

  it('does NOT show an error for BCP-47 locale "es-ES"', () => {
    const result = renderError({ portalCode: 'abc123', locale: 'es-ES' });
    expect(result).toBe(false);
  });

  it('does NOT show an error for BCP-47 locale "it-IT"', () => {
    const result = renderError({ portalCode: 'abc123', locale: 'it-IT' });
    expect(result).toBe(false);
  });

  it('does NOT show an error for an unsupported locale (falls back gracefully)', () => {
    const result = renderError({ portalCode: 'abc123', locale: 'pt-BR' });
    expect(result).toBe(false);
  });

  it('warns to the console for an unsupported locale instead of showing an error', () => {
    renderError({ portalCode: 'abc123', locale: 'pt-BR' });
    expect(console.warn).toHaveBeenCalled();
    expect(container.querySelector('h2')).toBeNull();
  });
});

