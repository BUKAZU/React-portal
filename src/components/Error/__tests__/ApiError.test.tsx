/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import * as sentryLib from '../../../_lib/sentry';
import ApiError from '../ApiError';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../_lib/sentry', () => ({
  reportError: jest.fn()
}));

jest.mock('../../../intl', () => ({
  t: (id: string) => id
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
  jest.clearAllMocks();
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

/** An error carrying several messages, as CreateBookingError does. */
function errorWithMessages(messages: string[]): Error & {
  messages: readonly string[];
} {
  return Object.assign(new Error(messages[0]), { messages });
}

describe('ApiError', () => {
  it('renders the message of a plain Error', () => {
    act(() => {
      root.render(<>{ApiError({ errors: new Error('Something failed') })}</>);
    });

    expect(container.querySelector('.bukazu-error-message')).not.toBeNull();
    expect(container.textContent).toContain('Something failed');
  });

  it('renders every message of an error carrying a messages list', () => {
    const error = errorWithMessages(['First problem', 'Second problem']);

    act(() => {
      root.render(<>{ApiError({ errors: error })}</>);
    });

    expect(container.textContent).toContain('First problem');
    expect(container.textContent).toContain('Second problem');
  });

  it('reports the error to Sentry when rendered', () => {
    act(() => {
      root.render(<>{ApiError({ errors: new Error('Request failed') })}</>);
    });

    expect(sentryLib.reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Request failed' })
    );
  });

  it('joins the messages of a multi-message error for Sentry', () => {
    const error = errorWithMessages(['First problem', 'Second problem']);

    act(() => {
      root.render(<>{ApiError({ errors: error })}</>);
    });

    expect(sentryLib.reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'First problem\nSecond problem' })
    );
  });

  it('reports the same error object only once', () => {
    const error = new Error('Reported once');

    act(() => {
      root.render(<>{ApiError({ errors: error })}</>);
    });
    act(() => {
      root.render(<>{ApiError({ errors: error })}</>);
    });

    expect(sentryLib.reportError).toHaveBeenCalledTimes(1);
  });
});
