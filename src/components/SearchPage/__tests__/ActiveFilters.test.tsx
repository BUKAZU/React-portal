import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import ActiveFilters from '../ActiveFilters';
import type { ActiveFilter } from '../../../_lib/active_filters';

jest.mock('../../icons/Close.svg', () => () => (
  <svg data-testid="close-icon" />
));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const items: ActiveFilter[] = [
  {
    key: 'countries',
    label: 'Country',
    value: 'Spain',
    text: 'Country: Spain'
  },
  { key: 'persons_min', label: 'Persons', value: '4', text: 'Persons: 4' }
];

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function render(
  props: Partial<React.ComponentProps<typeof ActiveFilters>> = {}
) {
  act(() => {
    root.render(
      <ActiveFilters
        items={items}
        onRemove={jest.fn()}
        onClear={jest.fn()}
        {...props}
      />
    );
  });
}

beforeEach(() => {
  (window as any).__localeId__ = 'en';
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

describe('ActiveFilters', () => {
  it('renders nothing without active filters', () => {
    render({ items: [] });

    expect(container.innerHTML).toBe('');
  });

  it('renders one pill per active filter with its text', () => {
    render();

    const pills = container.querySelectorAll('.bu-pill');
    expect(pills).toHaveLength(2);
    expect(pills[0].textContent).toBe('Country: Spain');
    expect(pills[0].getAttribute('aria-label')).toBe('Remove Country: Spain');
  });

  it('shows the active count in the header', () => {
    render();

    expect(
      container.querySelector('.bu-active-filters-header')?.textContent
    ).toContain('Active filters (2)');
  });

  it('calls onRemove with the filter key when a pill is clicked', () => {
    const onRemove = jest.fn();
    render({ onRemove });

    act(() => {
      (
        container.querySelector(
          '[data-filter-key="persons_min"]'
        ) as HTMLButtonElement
      ).click();
    });

    expect(onRemove).toHaveBeenCalledWith('persons_min');
  });

  it('calls onClear when "Clear all" is clicked', () => {
    const onClear = jest.fn();
    render({ onClear });

    act(() => {
      (container.querySelector('.bu-link-button') as HTMLButtonElement).click();
    });

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
