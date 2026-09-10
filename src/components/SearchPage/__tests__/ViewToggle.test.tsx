import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import ViewToggle from '../ViewToggle';

jest.mock('../../icons/Grid.svg', () => () => <svg data-testid="grid-icon" />);
jest.mock('../../icons/ViewList.svg', () => () => (
  <svg data-testid="list-icon" />
));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function buttons(): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('.bu-view-toggle button'));
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

describe('ViewToggle', () => {
  it('marks the active mode as pressed', () => {
    act(() => {
      root.render(<ViewToggle mode="list" onChange={jest.fn()} />);
    });

    const [grid, list] = buttons();
    expect(grid.getAttribute('aria-pressed')).toBe('false');
    expect(list.getAttribute('aria-pressed')).toBe('true');
    expect(grid.getAttribute('aria-label')).toBe('Grid view');
    expect(list.getAttribute('aria-label')).toBe('List view');
  });

  it('reports the clicked mode', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(<ViewToggle mode="grid" onChange={onChange} />);
    });

    const [grid, list] = buttons();
    act(() => {
      list.click();
    });
    act(() => {
      grid.click();
    });

    expect(onChange.mock.calls).toEqual([['list'], ['grid']]);
  });
});
