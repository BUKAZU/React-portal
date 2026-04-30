/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { GraphQLError } from 'graphql';
import * as sentryLib from '../../../_lib/sentry';
import ApiError from '../ApiError';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../_lib/sentry', () => ({
  reportError: jest.fn()
}));

jest.mock(
  '../../Modal',
  () =>
    ({ children }: { children: React.ReactNode }) => (
      <div data-testid="modal">{children}</div>
    )
);

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

function makeGraphQLErrors(messages: string[]): GraphQLError[] {
  return messages.map((message) => new GraphQLError(message));
}

describe('ApiError', () => {
  it('renders error messages from graphQLErrors', () => {
    const error = makeGraphQLErrors(['Something failed']);

    act(() => {
      root.render(<>{ApiError({ errors: error })}</>);
    });

    expect(container.querySelector('.bukazu-error-message')).not.toBeNull();
    expect(container.textContent).toContain('Something failed');
  });

  it('reports the error to Sentry when rendered', () => {
    const error = makeGraphQLErrors(['GraphQL error']);

    act(() => {
      root.render(<>{ApiError({ errors: error })}</>);
    });

    expect(sentryLib.reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'GraphQL error' })
    );
  });

  it('wraps the error in a Modal when modal=true', () => {
    const error = makeGraphQLErrors(['Modal error']);

    act(() => {
      root.render(<>{ApiError({ errors: error }, true)}</>);
    });

    expect(container.querySelector('[data-testid="modal"]')).not.toBeNull();
    expect(sentryLib.reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Modal error' })
    );
  });

  it('supports Apollo-style callers that pass graphQLErrors on an object', () => {
    const error = { graphQLErrors: makeGraphQLErrors(['Object-shaped error']) };

    act(() => {
      root.render(<>{ApiError({ errors: error })}</>);
    });

    expect(container.textContent).toContain('Object-shaped error');
  });
});
