/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import IntegrationError from '../IntegrationError';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderError(props: React.ComponentProps<typeof IntegrationError>) {
  act(() => {
    root.render(<IntegrationError {...props} />);
  });
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  jest.clearAllMocks();
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

describe('IntegrationError', () => {
  it('renders nothing when all props are valid', () => {
    renderError({ portalCode: 'VALID', locale: 'en' });

    expect(container.innerHTML).toBe('');
  });

  it('does not show an error for BCP-47 locales', () => {
    renderError({ portalCode: 'VALID', locale: 'nl-NL' });

    expect(container.querySelector('h2')).toBeNull();
  });

  it('warns and falls back gracefully for unsupported locales', () => {
    renderError({ portalCode: 'VALID', locale: 'pt-BR' });

    expect(container.querySelector('h2')).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      "Locale 'pt-BR' is not supported, defaulting to English"
    );
  });

  it('warns for unsupported locales that start with "en"', () => {
    renderError({ portalCode: 'VALID', locale: 'eng' });

    expect(container.querySelector('h2')).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      "Locale 'eng' is not supported, defaulting to English"
    );
  });

  it('renders an error when portalCode is missing', () => {
    renderError({ portalCode: '', locale: 'en' });

    expect(container.querySelector('h2')).not.toBeNull();
  });

  it('renders an error when pageType is invalid', () => {
    renderError({ portalCode: 'VALID', locale: 'en', pageType: 'unknown' });

    expect(container.querySelector('h2')).not.toBeNull();
  });
});
