/**
 * Tests for src/website.tsx
 *
 * The module auto-initialises on import when the DOM is ready. These tests
 * exercise `mountPortal` (the per-element mount helper) and `init` (the
 * document-wide scanner) independently by mocking Portal and react-dom/client.
 */

import React from 'react';
import { act } from 'react';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// ---------------------------------------------------------------------------
// Mocks – must be declared before importing the module under test so that Jest
// hoists them before any module-level side-effects execute.
// ---------------------------------------------------------------------------

// Capture rendered elements so we can assert on props.
const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({ render: mockRender }));

jest.mock('react-dom/client', () => ({
  createRoot: (...args: unknown[]) => mockCreateRoot(...args)
}));

// Replace the heavy Portal component with a lightweight stub.
jest.mock('../index', () => (props: object) => (
  <div data-testid="portal" data-props={JSON.stringify(props)} />
));

// Mock Apollo and GQL to satisfy transitive imports from index.tsx.
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  ApolloProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )
}));

jest.mock('../_lib/gql', () => ({}));

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are set up.
// ---------------------------------------------------------------------------

import { mountPortal, init } from '../website';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeElement(attrs: Record<string, string | null> = {}): HTMLElement {
  const el = document.createElement('div');
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== null) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

/** Extract the props passed to the Portal stub from the last mockRender call. */
function lastPortalProps(): Record<string, unknown> {
  const lastCall = mockRender.mock.calls[mockRender.mock.calls.length - 1];
  // lastCall[0] is the React element; its props are on .props
  return (lastCall[0] as React.ReactElement).props as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Tests: mountPortal
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

describe('mountPortal – attribute parsing', () => {
  it('passes portal-code and object-code attributes as props', () => {
    const el = makeElement({ 'portal-code': 'ABC', 'object-code': 'OBJ1' });
    act(() => {
      mountPortal(el);
    });

    expect(mockCreateRoot).toHaveBeenCalledWith(el);
    const props = lastPortalProps();
    expect(props.portalCode).toBe('ABC');
    expect(props.objectCode).toBe('OBJ1');
  });

  it('defaults portalCode and objectCode to empty strings when attributes are absent', () => {
    const el = makeElement({});
    act(() => {
      mountPortal(el);
    });

    const props = lastPortalProps();
    expect(props.portalCode).toBe('');
    expect(props.objectCode).toBe('');
  });

  it('passes the page attribute as pageType', () => {
    const el = makeElement({ 'portal-code': 'X', page: 'reviews' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().pageType).toBe('reviews');
  });

  it('passes undefined for pageType when the page attribute is absent', () => {
    const el = makeElement({ 'portal-code': 'X' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().pageType).toBeUndefined();
  });
});

describe('mountPortal – locale validation', () => {
  it.each(['en', 'nl', 'de', 'fr', 'es', 'it'])(
    'passes supported locale "%s" through unchanged',
    (locale) => {
      const el = makeElement({ 'portal-code': 'X', language: locale });
      act(() => {
        mountPortal(el);
      });

      expect(lastPortalProps().locale).toBe(locale);
    }
  );

  it('falls back to "en" when the language attribute is absent', () => {
    const el = makeElement({ 'portal-code': 'X' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().locale).toBe('en');
  });

  it('falls back to "en" for an unrecognised language value', () => {
    const el = makeElement({ 'portal-code': 'X', language: 'xx' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().locale).toBe('en');
  });
});

describe('mountPortal – filters parsing', () => {
  it('parses a valid JSON filters attribute', () => {
    const filters = { persons_min: '2', arrival_date: '2024-07-01' };
    const el = makeElement({
      'portal-code': 'X',
      filters: JSON.stringify(filters)
    });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().filters).toEqual(filters);
  });

  it('defaults to an empty object when the filters attribute is absent', () => {
    const el = makeElement({ 'portal-code': 'X' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().filters).toEqual({});
  });

  it('defaults to an empty object when the filters attribute contains invalid JSON', () => {
    const el = makeElement({ 'portal-code': 'X', filters: 'not-json' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().filters).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Tests: init
// ---------------------------------------------------------------------------

describe('init', () => {
  it('mounts a portal on every .bukazu-app element in the document', () => {
    const el1 = makeElement({ 'portal-code': 'P1' });
    el1.className = 'bukazu-app';
    const el2 = makeElement({ 'portal-code': 'P2' });
    el2.className = 'bukazu-app';
    document.body.appendChild(el1);
    document.body.appendChild(el2);

    act(() => {
      init();
    });

    expect(mockCreateRoot).toHaveBeenCalledWith(el1);
    expect(mockCreateRoot).toHaveBeenCalledWith(el2);
    expect(mockCreateRoot).toHaveBeenCalledTimes(2);

    el1.remove();
    el2.remove();
  });

  it('does nothing when there are no .bukazu-app elements', () => {
    act(() => {
      init();
    });

    expect(mockCreateRoot).not.toHaveBeenCalled();
  });
});
