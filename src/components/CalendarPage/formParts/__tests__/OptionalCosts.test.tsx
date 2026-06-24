import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Formik } from 'formik';
import OptionalCosts from '../OptionalCosts';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../Modal', () => ({ children, buttonText }: any) => (
  <button type="button" data-testid="modal-button">
    {buttonText}
    {children}
  </button>
));

jest.mock('../../../icons/info.svg', () => () => (
  <span data-testid="info-icon" />
));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  (window as any).__localeId__ = 'en';
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
});

afterEach(() => {
  delete (window as any).__localeId__;
  act(() => {
    root.unmount();
  });
  container.remove();
});

function renderOptionalCosts(costs: any[]) {
  act(() => {
    root.render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <OptionalCosts costs={costs} />
      </Formik>
    );
  });
}

const baseCost = {
  id: 'towels',
  name: 'Towels',
  method: 'per_person',
  method_name: 'per person',
  amount: 5.5,
  max_available: 3,
  description: ''
};

describe('OptionalCosts – empty list', () => {
  it('renders nothing when costs array is empty', () => {
    renderOptionalCosts([]);
    expect(container.querySelector('.form-section')).toBeNull();
  });

  it('renders no form rows when all costs are excluded by method', () => {
    renderOptionalCosts([
      { ...baseCost, method: 'none' },
      { ...baseCost, method: 'total' }
    ]);
    expect(container.querySelectorAll('.form-row')).toHaveLength(0);
  });

  it('renders no form rows when all costs have max_available 0', () => {
    renderOptionalCosts([{ ...baseCost, max_available: 0 }]);
    expect(container.querySelectorAll('.form-row')).toHaveLength(0);
  });
});

describe('OptionalCosts – section heading', () => {
  it('renders the "Extra options" heading', () => {
    renderOptionalCosts([{ ...baseCost, max_available: 1 }]);
    const heading = container.querySelector('h2');
    expect(heading?.textContent).toBe('Extra options');
  });
});

describe('OptionalCosts – costs with max_available = 1', () => {
  it('renders a yes/no select for a cost with max_available = 1', () => {
    renderOptionalCosts([{ ...baseCost, max_available: 1 }]);
    const selects = container.querySelectorAll('select');
    expect(selects).toHaveLength(1);
  });

  it('renders "No" and "Yes" options for max_available = 1', () => {
    renderOptionalCosts([{ ...baseCost, max_available: 1 }]);
    const options = container.querySelectorAll('select option');
    expect(options).toHaveLength(2);
    expect(options[0].textContent).toBe('No');
    expect(options[1].textContent).toBe('Yes');
  });

  it('renders the cost label', () => {
    renderOptionalCosts([{ ...baseCost, max_available: 1 }]);
    const label = container.querySelector('label');
    expect(label?.textContent).toBe('Towels');
  });

  it('renders the cost amount formatted to 2 decimal places', () => {
    renderOptionalCosts([{ ...baseCost, max_available: 1 }]);
    expect(container.textContent).toContain('5.50');
  });

  it('renders the method_name after the amount', () => {
    renderOptionalCosts([{ ...baseCost, max_available: 1 }]);
    expect(container.textContent).toContain('per person');
  });
});

describe('OptionalCosts – costs with max_available > 1', () => {
  it('renders a numeric select for a cost with max_available = 3', () => {
    renderOptionalCosts([{ ...baseCost, max_available: 3 }]);
    const selects = container.querySelectorAll('select');
    expect(selects).toHaveLength(1);
  });

  it('renders 0..max_available options for a multi-quantity cost', () => {
    renderOptionalCosts([{ ...baseCost, max_available: 3 }]);
    const options = container.querySelectorAll('select option');
    // createPersonsArray(3) returns [0, 1, 2, 3] → 4 options
    expect(options).toHaveLength(4);
    expect(options[0].value).toBe('0');
    expect(options[3].value).toBe('3');
  });
});

describe('OptionalCosts – description modal', () => {
  it('renders a modal button when a description is provided', () => {
    renderOptionalCosts([
      { ...baseCost, max_available: 1, description: 'Includes 2 towels' }
    ]);
    expect(container.querySelector('[data-testid="modal-button"]')).not.toBeNull();
  });

  it('does not render a modal button when description is empty', () => {
    renderOptionalCosts([{ ...baseCost, max_available: 1, description: '' }]);
    expect(container.querySelector('[data-testid="modal-button"]')).toBeNull();
  });

  it('shows the description text inside the modal', () => {
    renderOptionalCosts([
      {
        ...baseCost,
        max_available: 1,
        description: 'Includes 2 fresh towels per person'
      }
    ]);
    expect(container.textContent).toContain(
      'Includes 2 fresh towels per person'
    );
  });
});

describe('OptionalCosts – excluded rows', () => {
  it('excludes a cost with method "none" even when max_available > 0', () => {
    renderOptionalCosts([{ ...baseCost, method: 'none', max_available: 2 }]);
    expect(container.querySelectorAll('.form-row')).toHaveLength(0);
  });

  it('excludes a cost with method "total" even when max_available > 0', () => {
    renderOptionalCosts([{ ...baseCost, method: 'total', max_available: 2 }]);
    expect(container.querySelectorAll('.form-row')).toHaveLength(0);
  });

  it('renders only eligible costs when mixed with excluded ones', () => {
    renderOptionalCosts([
      { ...baseCost, id: 'excl', method: 'none', max_available: 1 },
      {
        ...baseCost,
        id: 'incl',
        name: 'Bed linen',
        method: 'per_stay',
        max_available: 1
      }
    ]);
    const labels = container.querySelectorAll('label');
    expect(labels).toHaveLength(1);
    expect(labels[0].textContent).toBe('Bed linen');
  });
});
