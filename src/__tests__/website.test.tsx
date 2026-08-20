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

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are set up.
// ---------------------------------------------------------------------------

import { mountPortal, init, version } from '../website';

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
  document.body.innerHTML = '';
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

  // The WordPress plugin renders page="" and object-code="" for the calendar
  // module, so a present-but-empty attribute must stay an empty string rather
  // than becoming undefined.
  it('keeps present-but-empty page and object-code attributes as empty strings', () => {
    const el = makeElement({
      'portal-code': 'X',
      'object-code': '',
      page: ''
    });
    act(() => {
      mountPortal(el);
    });

    const props = lastPortalProps();
    expect(props.objectCode).toBe('');
    expect(props.pageType).toBe('');
  });
});

describe('mountPortal – locale handling', () => {
  // The language attribute is handed to Portal verbatim; normalisation (BCP-47
  // tags, casing, the fallback to English) is Portal's job and is covered by
  // src/_lib/__tests__/locale.test.ts.
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

  it.each(['nl-NL', 'de_DE', 'EN'])(
    'passes the full locale tag "%s" through for Portal to normalise',
    (locale) => {
      const el = makeElement({ 'portal-code': 'X', language: locale });
      act(() => {
        mountPortal(el);
      });

      expect(lastPortalProps().locale).toBe(locale);
    }
  );

  it('passes undefined when the language attribute is absent', () => {
    const el = makeElement({ 'portal-code': 'X' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().locale).toBeUndefined();
  });

  it('passes an unrecognised language value through for Portal to reject', () => {
    const el = makeElement({ 'portal-code': 'X', language: 'xx' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().locale).toBe('xx');
  });
});

describe('mountPortal – Sentry DSN', () => {
  const BAKED_DSN = 'https://baked@o0.ingest.sentry.io/1';
  const originalDsn = __SENTRY_DSN__;

  function setBakedDsn(dsn: string): void {
    (globalThis as unknown as { __SENTRY_DSN__: string }).__SENTRY_DSN__ = dsn;
  }

  afterEach(() => {
    setBakedDsn(originalDsn);
  });

  it('prefers the sentry-dsn attribute over the baked-in DSN', () => {
    setBakedDsn(BAKED_DSN);
    const el = makeElement({
      'portal-code': 'X',
      'sentry-dsn': 'https://attr@o0.ingest.sentry.io/2'
    });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().sentryDsn).toBe(
      'https://attr@o0.ingest.sentry.io/2'
    );
  });

  it('uses the baked-in DSN when the attribute is absent', () => {
    setBakedDsn(BAKED_DSN);
    const el = makeElement({ 'portal-code': 'X' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().sentryDsn).toBe(BAKED_DSN);
  });

  it('uses the baked-in DSN when the attribute is present but empty', () => {
    setBakedDsn(BAKED_DSN);
    const el = makeElement({ 'portal-code': 'X', 'sentry-dsn': '' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().sentryDsn).toBe(BAKED_DSN);
  });

  it.each(['off', 'none'])(
    'disables reporting when sentry-dsn is "%s"',
    (value) => {
      setBakedDsn(BAKED_DSN);
      const el = makeElement({ 'portal-code': 'X', 'sentry-dsn': value });
      act(() => {
        mountPortal(el);
      });

      expect(lastPortalProps().sentryDsn).toBeUndefined();
    }
  );

  it('passes undefined when neither the attribute nor the baked DSN is set', () => {
    setBakedDsn('');
    const el = makeElement({ 'portal-code': 'X' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().sentryDsn).toBeUndefined();
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

  it('defaults to an empty object when the filters attribute is a JSON array', () => {
    const el = makeElement({ 'portal-code': 'X', filters: '["a","b"]' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().filters).toEqual({});
  });

  it('defaults to an empty object when the filters attribute is a JSON null', () => {
    const el = makeElement({ 'portal-code': 'X', filters: 'null' });
    act(() => {
      mountPortal(el);
    });

    expect(lastPortalProps().filters).toEqual({});
  });

  it('defaults to an empty object when the filters attribute is a JSON number', () => {
    const el = makeElement({ 'portal-code': 'X', filters: '42' });
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

  it('does nothing when the document has no host element at all', () => {
    act(() => {
      init();
    });

    expect(mockCreateRoot).not.toHaveBeenCalled();
  });

  it('falls back to #bukazu-app when no element carries the class', () => {
    const el = makeElement({ 'portal-code': 'BY_ID' });
    el.id = 'bukazu-app';
    document.body.appendChild(el);

    act(() => {
      init();
    });

    expect(mockCreateRoot).toHaveBeenCalledWith(el);
    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
  });

  it('ignores #bukazu-app when class-based hosts exist', () => {
    const byClass = makeElement({ 'portal-code': 'BY_CLASS' });
    byClass.className = 'bukazu-app';
    const byId = makeElement({ 'portal-code': 'BY_ID' });
    byId.id = 'bukazu-app';
    document.body.appendChild(byClass);
    document.body.appendChild(byId);

    act(() => {
      init();
    });

    expect(mockCreateRoot).toHaveBeenCalledWith(byClass);
    expect(mockCreateRoot).not.toHaveBeenCalledWith(byId);
    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
  });

  it('mounts an element that carries both the class and the id only once', () => {
    const el = makeElement({ 'portal-code': 'BOTH' });
    el.className = 'bukazu-app';
    el.id = 'bukazu-app';
    document.body.appendChild(el);

    act(() => {
      init();
    });

    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: double-mount prevention
// ---------------------------------------------------------------------------

describe('mountPortal – double-mount prevention', () => {
  it('reuses the same root when called twice on the same element', () => {
    const el = makeElement({ 'portal-code': 'X' });
    act(() => {
      mountPortal(el);
      mountPortal(el);
    });

    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Tests: version export and the cross-instance root registry
// ---------------------------------------------------------------------------

describe('version', () => {
  it('exposes the version baked in at build time', () => {
    expect(version).toBe(__PORTAL_VERSION__);
  });
});

describe('root registry', () => {
  it('is shared across module instances so a double-loaded bundle mounts once', () => {
    const el = makeElement({ 'portal-code': 'X' });
    act(() => {
      mountPortal(el);
    });

    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const reloaded = require('../website') as {
      mountPortal: typeof mountPortal;
    };
    act(() => {
      reloaded.mountPortal(el);
    });

    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Tests: auto-initialisation on import
// ---------------------------------------------------------------------------

describe('auto-initialisation', () => {
  /** Overrides the read-only `document.readyState` getter for one test. */
  function withReadyState(state: DocumentReadyState, run: () => void): void {
    const descriptor = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'readyState'
    );
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => state
    });
    try {
      run();
    } finally {
      delete (document as unknown as Record<string, unknown>).readyState;
      if (descriptor) {
        Object.defineProperty(Document.prototype, 'readyState', descriptor);
      }
    }
  }

  it('waits for DOMContentLoaded when the document is still loading', () => {
    const addEventListener = jest.spyOn(document, 'addEventListener');

    withReadyState('loading', () => {
      jest.resetModules();
      require('../website');
    });

    expect(addEventListener).toHaveBeenCalledWith(
      'DOMContentLoaded',
      expect.any(Function)
    );
    expect(mockCreateRoot).not.toHaveBeenCalled();

    // The registered listener is the real `init`, so firing it mounts.
    const listener = addEventListener.mock.calls.find(
      ([type]) => type === 'DOMContentLoaded'
    )?.[1] as () => void;
    const el = makeElement({ 'portal-code': 'DEFERRED' });
    el.className = 'bukazu-app';
    document.body.appendChild(el);
    act(() => {
      listener();
    });

    expect(mockCreateRoot).toHaveBeenCalledWith(el);
    addEventListener.mockRestore();
  });

  it('mounts immediately when the document is already parsed', () => {
    const el = makeElement({ 'portal-code': 'IMMEDIATE' });
    el.className = 'bukazu-app';
    document.body.appendChild(el);

    withReadyState('complete', () => {
      jest.resetModules();
      require('../website');
    });

    expect(mockCreateRoot).toHaveBeenCalledWith(el);
  });
});
