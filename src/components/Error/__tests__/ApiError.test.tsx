/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import * as sentryLib from '../../../_lib/sentry';
import ApiError from '../ApiError';
import { ApolloError } from '@apollo/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../_lib/sentry', () => ({
  reportError: jest.fn()
}));

jest.mock('../../Modal', () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="modal">{children}</div>
));

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

function makeApolloError(messages: string[]): ApolloError {
  const error = new ApolloError({
    graphQLErrors: messages.map((m) => ({ message: m } as any))
  });
  return error;
}

describe('ApiError', () => {
  it('renders error messages from graphQLErrors', () => {
    const error = makeApolloError(['Something failed']);

    act(() => {
      root.render(<>{ApiError({ errors: error })}</>);
    });

    expect(container.querySelector('.bukazu-error-message')).not.toBeNull();
    expect(container.textContent).toContain('Something failed');
  });

  it('reports the error to Sentry when rendered', () => {
    const error = makeApolloError(['GraphQL error']);

    act(() => {
      root.render(<>{ApiError({ errors: error })}</>);
    });

    expect(sentryLib.reportError).toHaveBeenCalledWith(error);
  });

  it('wraps the error in a Modal when modal=true', () => {
    const error = makeApolloError(['Modal error']);

    act(() => {
      root.render(<>{ApiError({ errors: error }, true)}</>);
    });

    expect(container.querySelector('[data-testid="modal"]')).not.toBeNull();
    expect(sentryLib.reportError).toHaveBeenCalledWith(error);
  });
});
