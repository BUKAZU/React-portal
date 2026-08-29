/**
 * @jest-environment jsdom
 */

import React, { ErrorInfo } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from '../ErrorBoundary';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

// Suppress React's internal error output during boundary tests
const originalConsoleError = console.error;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  jest.clearAllMocks();
  console.error = jest.fn();
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  console.error = originalConsoleError;
});

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }): JSX.Element {
  if (shouldThrow) {
    throw new Error('test render error');
  }
  return <div data-testid="child">ok</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    act(() => {
      root.render(
        <ErrorBoundary>
          {[<ThrowingChild key="c" shouldThrow={false} />]}
        </ErrorBoundary>
      );
    });

    expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
  });

  it('renders fallback UI when a child throws', () => {
    act(() => {
      root.render(
        <ErrorBoundary>
          {[<ThrowingChild key="c" shouldThrow={true} />]}
        </ErrorBoundary>
      );
    });

    expect(container.querySelector('h1')).not.toBeNull();
  });
});
