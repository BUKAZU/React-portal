/**
 * @jest-environment jsdom
 */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import InsurancesAndRequired from '../InsurancesAndRequired';
import OptionalNotOnSite from '../OptionalNotOnSite';
import OptionalOnSite from '../OptionalOnSite';
import OnSite from '../OnSite';
import Totals from '../Totals';

const mockCostRow = jest.fn(() => <tr data-testid="cost-row" />);

jest.mock('../../../../intl', () => ({
  t: (id: string) => `t_${id}`,
  formatNumber: (value: number) => `formatted_${value}`,
  useLocale: () => ({ formatMessage: ({ id }: { id: string }) => `t_${id}` })
}));

jest.mock('../CostRow', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockCostRow(props);
    return <tr data-testid="cost-row" />;
  }
}));

function render(node: React.ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: ReturnType<typeof createRoot> | null = null;
  act(() => {
    root = createRoot(container);
  });
  act(() => {
    root?.render(node);
  });
  return { container, root: root! };
}

describe('Booking summary cost sections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders insurance and required off-site costs', () => {
    const prices = {
      total_costs: {
        insurances: { cancel_insurance: 0, insurance_costs: 8 },
        required_costs: { not_on_site: [{ id: 2, amount: 20 }], on_site: [] }
      },
      required_house_costs: [
        { id: 1, on_site: false, gl: '0101', method: 'none', amount: 0, name: 'cleaning' },
        { id: 2, on_site: false, gl: '0102', method: 'per_unit', amount: 5, name: 'tax' },
        { id: 3, on_site: false, gl: '0103', method: 'per_unit', amount: 0, name: 'skip' }
      ]
    } as any;

    const { root, container } = render(<InsurancesAndRequired prices={prices} />);

    expect(mockCostRow).toHaveBeenCalledTimes(3);
    expect(mockCostRow).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'insurance_costs', amount: 8, formatName: true })
    );
    expect(mockCostRow).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'cleaning' }));
    expect(mockCostRow).toHaveBeenCalledWith(expect.objectContaining({ id: 2, amount: 20 }));

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders optional costs that are not on site', () => {
    const prices = {
      total_costs: {
        optional_costs: {
          not_on_site: [
            { id: 11, amount: 15, nr_of_items: 1 },
            { id: 12, amount: 7, nr_of_items: 2 },
            { id: 13, amount: 0, nr_of_items: 0 }
          ]
        }
      },
      optional_house_costs: [
        { id: 10, on_site: false, gl: '0100', method: 'none', amount: 5, name: 'linen' },
        { id: 11, on_site: false, gl: '0100', method: 'on_site', amount: 3, name: 'parking' },
        { id: 12, on_site: false, gl: '0100', method: 'per_unit', amount: 2, name: 'extra' },
        { id: 13, on_site: false, gl: '0100', method: 'on_site', amount: 1, name: 'ignored' }
      ]
    } as any;

    const { root, container } = render(<OptionalNotOnSite prices={prices} />);

    expect(mockCostRow).toHaveBeenCalledTimes(3);
    expect(mockCostRow).toHaveBeenCalledWith(expect.objectContaining({ id: 10, name: 'linen' }));
    expect(mockCostRow).toHaveBeenCalledWith(
      expect.objectContaining({ id: 11, forceMethod: true, amount: 3 })
    );
    expect(mockCostRow).toHaveBeenCalledWith(expect.objectContaining({ id: 12, amount: 7 }));

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders optional on-site costs respecting nr_of_items and amount', () => {
    const prices = {
      total_costs: {
        optional_costs: {
          on_site: [
            { id: 20, amount: 12, nr_of_items: 1 },
            { id: 21, amount: 0, nr_of_items: 0 },
            { id: 22, amount: 9, nr_of_items: 2 }
          ]
        }
      },
      optional_house_costs: [
        { id: 20, on_site: true, gl: '0100', method: 'none', amount: 5, name: 'bed' },
        { id: 21, on_site: true, gl: '0100', method: 'on_site', amount: 4, name: 'bike' },
        { id: 22, on_site: true, gl: '0100', method: 'per_unit', amount: 3, name: 'breakfast' }
      ]
    } as any;

    const { root, container } = render(<OptionalOnSite prices={prices} />);

    const renderedIds = mockCostRow.mock.calls
      .map(([props]) => props as { id?: number } | undefined)
      .filter((props): props is { id?: number } => Boolean(props))
      .map((props) => props.id)
      .filter((id): id is number => id !== undefined);

    expect(renderedIds).toEqual(expect.arrayContaining([20, 22]));
    expect(renderedIds).not.toContain(21);

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders required on-site costs and passes prices to OptionalOnSite', () => {
    const prices = {
      total_costs: {
        required_costs: { on_site: [{ id: 2, amount: 9 }], not_on_site: [] },
        optional_costs: { on_site: [], not_on_site: [] }
      },
      required_house_costs: [
        { id: 1, on_site: true, gl: '0101', method: 'none', amount: 4, name: 'cleaning' },
        { id: 2, on_site: true, gl: '0101', method: 'per_unit', amount: 3, name: 'tax' }
      ],
      optional_house_costs: []
    } as any;

    const { root, container } = render(<OnSite prices={prices} />);

    expect(mockCostRow).toHaveBeenCalledTimes(2);
    expect(mockCostRow).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'cleaning' }));
    expect(mockCostRow).toHaveBeenCalledWith(expect.objectContaining({ id: 2, amount: 9 }));

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('only renders deposit rows with gl 0120 and positive amount', () => {
    const prices = {
      total_costs: {
        sub_total: 50,
        total_price: 60,
        required_costs: { on_site: [{ id: 1, amount: 5 }, { id: 3, amount: 0 }], not_on_site: [] },
        optional_costs: { on_site: [{ id: 2, amount: 7 }], not_on_site: [] }
      },
      required_house_costs: [
        { id: 1, gl: '0120', on_site: true, method: 'none', amount: 0, name: 'deposit_on' },
        { id: 3, gl: '0120', on_site: true, method: 'none', amount: 0, name: 'deposit_zero' }
      ],
      optional_house_costs: [
        { id: 2, gl: '0120', on_site: true, method: 'none', amount: 0, name: 'optional_deposit' }
      ]
    } as any;

    const { root, container } = render(<Totals prices={prices} />);

    expect(mockCostRow).toHaveBeenCalledTimes(2);
    expect(mockCostRow).toHaveBeenCalledWith(expect.objectContaining({ id: 1, amount: 5 }));
    expect(mockCostRow).toHaveBeenCalledWith(expect.objectContaining({ id: 2, amount: 7 }));

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
