/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import CostRow from '../CostRow';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../../intl', () => ({
  t: (id: string) => `t_${id}`,
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
    `formatted_${value.toFixed(options?.maximumFractionDigits ?? 0)}`,
  useLocale: () => ({ formatMessage: ({ id }: { id: string }) => `t_${id}` })
}));

jest.mock('../Description', () => ({
  __esModule: true,
  default: ({ description }: { description: string }) => (
    <span data-testid="description">{description}</span>
  )
}));

function renderRow(row: JSX.Element) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: ReturnType<typeof createRoot> | null = null;
  act(() => {
    root = createRoot(container);
  });
  act(() => {
    root?.render(
      <table>
        <tbody>{row}</tbody>
      </table>
    );
  });

  return { container, root };
}

describe('CostRow', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('formats translated name, description and amount with currency', () => {
    const { container, root } = renderRow(
      <CostRow
        name="rent_price"
        amount={50}
        description="more info"
        method_name="per stay"
        formatName={true}
        forceMethod={true}
      />
    );

    const cells = container.querySelectorAll('td');
    expect(cells[0].textContent).toContain('t_rent_price');
    expect(container.querySelector('[data-testid=\"description\"]')?.textContent).toBe(
      'more info'
    );
    expect(cells[1].textContent).toContain('€');
    expect(cells[1].textContent).toContain('formatted_50.00');
    expect(cells[1].textContent).toContain('per stay');

    act(() => {
      root?.unmount();
    });
    container.remove();
  });

  it('shows method name when no amount is present', () => {
    const { container, root } = renderRow(
      <CostRow name="deposit" amount={0} method_name="on arrival" />
    );

    const priceCell = container.querySelector('td.price');
    expect(priceCell?.textContent).toBe('on arrival');

    act(() => {
      root?.unmount();
    });
    container.remove();
  });
});
