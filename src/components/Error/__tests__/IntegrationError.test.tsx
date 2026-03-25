/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import * as sentryLib from '../../../_lib/sentry';
import IntegrationError from '../IntegrationError';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../_lib/sentry', () => ({
  reportMessage: jest.fn()
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

describe('IntegrationError', () => {
  it('renders nothing when all props are valid', () => {
    act(() => {
      root.render(
        <IntegrationError portalCode="VALID" locale="en" />
      );
    });

    expect(container.innerHTML).toBe('');
    expect(sentryLib.reportMessage).not.toHaveBeenCalled();
  });

  it('renders an error and reports to Sentry when portalCode is missing', () => {
    act(() => {
      root.render(<IntegrationError portalCode="" locale="en" />);
    });

    expect(container.querySelector('h2')).not.toBeNull();
    expect(sentryLib.reportMessage).toHaveBeenCalledWith(
      'No portal code is specified, so portal is not working'
    );
  });

  it('renders an error and reports to Sentry when locale is invalid', () => {
    act(() => {
      root.render(<IntegrationError portalCode="VALID" locale="xx" />);
    });

    expect(container.querySelector('h2')).not.toBeNull();
    expect(sentryLib.reportMessage).toHaveBeenCalledWith('Invalid locale');
  });

  it('renders an error and reports to Sentry when pageType is invalid', () => {
    act(() => {
      root.render(
        <IntegrationError portalCode="VALID" locale="en" pageType="unknown" />
      );
    });

    expect(container.querySelector('h2')).not.toBeNull();
    expect(sentryLib.reportMessage).toHaveBeenCalledWith(
      "'unknown' is not a valid page"
    );
  });

  it('reports each distinct error message to Sentry separately', () => {
    act(() => {
      root.render(<IntegrationError portalCode="" locale="xx" />);
    });

    expect(sentryLib.reportMessage).toHaveBeenCalledTimes(2);
  });

  it('does not re-report to Sentry when the same errors are re-rendered', () => {
    act(() => {
      root.render(<IntegrationError portalCode="" locale="en" />);
    });
    expect(sentryLib.reportMessage).toHaveBeenCalledTimes(1);

    // Re-render with identical invalid props — effect must not fire again
    act(() => {
      root.render(<IntegrationError portalCode="" locale="en" />);
    });
    expect(sentryLib.reportMessage).toHaveBeenCalledTimes(1);
  });
});
