import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Summary from '..';
import type { HouseType } from '../../../../types';
import type { PossibleValues } from '../../formParts/form_types';

jest.mock(
  '../StayCard',
  () =>
    ({ onChangeDates }: { onChangeDates?: () => void }) => (
      <button data-testid="stay-card" onClick={onChangeDates}>
        stay
      </button>
    )
);
jest.mock('../../formParts/BookingOrOption', () => () => (
  <div data-testid="booking-or-option" />
));
jest.mock(
  '../CostSummary',
  () =>
    ({ onPrices }: { onPrices?: (p: unknown) => void }) => (
      <button
        data-testid="cost-summary"
        onClick={() => onPrices?.({ total: 1 })}
      >
        costs
      </button>
    )
);

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('Summary', () => {
  it('stacks the stay card, booking/option and the costs, wiring the callbacks', () => {
    const onChangeDates = jest.fn();
    const onPrices = jest.fn();
    act(() => {
      root.render(
        <Summary
          house={{} as HouseType}
          values={{} as PossibleValues}
          onChangeDates={onChangeDates}
          onPrices={onPrices}
        />
      );
    });
    const summary = container.querySelector('.bu-summary') as HTMLElement;
    expect(summary.children[0].getAttribute('data-testid')).toBe('stay-card');
    expect(summary.children[1].getAttribute('data-testid')).toBe(
      'booking-or-option'
    );
    expect(summary.children[2].getAttribute('data-testid')).toBe(
      'cost-summary'
    );
    act(() => {
      (summary.children[0] as HTMLElement).click();
      (summary.children[2] as HTMLElement).click();
    });
    expect(onChangeDates).toHaveBeenCalledTimes(1);
    expect(onPrices).toHaveBeenCalledWith({ total: 1 });
  });

  it('renders without the optional callbacks', () => {
    act(() => {
      root.render(
        <Summary house={{} as HouseType} values={{} as PossibleValues} />
      );
    });
    const summary = container.querySelector('.bu-summary') as HTMLElement;
    act(() => {
      (summary.children[0] as HTMLElement).click();
      (summary.children[2] as HTMLElement).click();
    });
    expect(summary.children).toHaveLength(3);
  });
});
