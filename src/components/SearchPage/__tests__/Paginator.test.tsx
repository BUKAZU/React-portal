import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Paginator, { buildPageRange } from '../Paginator';

// Mock SVG loading icon
jest.mock('../../icons/loading.svg', () => () => <svg data-testid="loading" />);

// Mock Apollo useQuery
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
  gql: (query: TemplateStringsArray) => query
}));

// Mock SearchQueries
jest.mock('../../../_lib/SearchQueries', () => ({
  HOUSE_COUNT_QUERY: 'HOUSE_COUNT_QUERY'
}));

import { useQuery } from '@apollo/client';

const mockUseQuery = useQuery as jest.Mock;

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

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
  act(() => {
    root.unmount();
  });
  container.remove();
  jest.clearAllMocks();
});

const defaultProps = {
  onPageChange: jest.fn(),
  variables: {},
  activePage: 0,
  limit: 10
};

function makeHouses(count: number) {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1 }));
}

describe('buildPageRange', () => {
  it('returns all pages when pageCount <= 7', () => {
    expect(buildPageRange(0, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(buildPageRange(0, 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('returns first page, ellipsis, range near end when activePage is near end', () => {
    const result = buildPageRange(9, 12);
    expect(result[0]).toBe(0);
    expect(result).toContain('...');
    expect(result[result.length - 1]).toBe(11);
  });

  it('returns first page, range, ellipsis, last page when activePage is near start', () => {
    const result = buildPageRange(1, 12);
    expect(result[0]).toBe(0);
    expect(result).toContain('...');
    expect(result[result.length - 1]).toBe(11);
  });

  it('includes ellipsis on both sides when activePage is in the middle', () => {
    const result = buildPageRange(6, 15);
    expect(result[0]).toBe(0);
    expect(result[result.length - 1]).toBe(14);
    const ellipsisCount = result.filter((p) => p === '...').length;
    expect(ellipsisCount).toBe(2);
  });
});

describe('Paginator', () => {
  it('renders a loading spinner when loading', () => {
    mockUseQuery.mockReturnValue({ loading: true, error: null, data: null });

    act(() => {
      root.render(<Paginator {...defaultProps} />);
    });

    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
  });

  it('renders an error message when query fails', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: new Error('fail'),
      data: null
    });

    act(() => {
      root.render(<Paginator {...defaultProps} />);
    });

    expect(container.textContent).toContain('Error');
  });

  it('renders results count', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { PortalSite: { houses: makeHouses(25) } }
    });

    act(() => {
      root.render(<Paginator {...defaultProps} />);
    });

    expect(container.textContent).toContain('25');
  });

  it('does not render pagination when there is only a single page', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { PortalSite: { houses: makeHouses(5) } } // 5 results / 10 per page = 1 page
    });

    act(() => {
      root.render(<Paginator {...defaultProps} limit={10} />);
    });

    expect(container.querySelector('.bu-pagination')).toBeNull();
  });

  it('does not render pagination when there are no results', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { PortalSite: { houses: makeHouses(0) } }
    });

    act(() => {
      root.render(<Paginator {...defaultProps} />);
    });

    expect(container.querySelector('.bu-pagination')).toBeNull();
  });

  it('renders pagination buttons', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { PortalSite: { houses: makeHouses(30) } }
    });

    act(() => {
      root.render(<Paginator {...defaultProps} />);
    });

    const buttons = container.querySelectorAll('.bu-pagination button');
    expect(buttons.length).toBeGreaterThan(2); // prev + pages + next
  });

  it('disables previous button on first page', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { PortalSite: { houses: makeHouses(30) } }
    });

    act(() => {
      root.render(<Paginator {...defaultProps} activePage={0} />);
    });

    const prevBtn = container.querySelector<HTMLButtonElement>(
      '.bu-pagination li:first-child button'
    );
    expect(prevBtn?.disabled).toBe(true);
  });

  it('disables next button on last page', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { PortalSite: { houses: makeHouses(30) } }
    });

    // 30 houses / 10 per page = 3 pages (0, 1, 2). Last page = 2.
    act(() => {
      root.render(<Paginator {...defaultProps} activePage={2} />);
    });

    const nextBtn = container.querySelector<HTMLButtonElement>(
      '.bu-pagination li:last-child button'
    );
    expect(nextBtn?.disabled).toBe(true);
  });

  it('calls onPageChange with the correct page when a page button is clicked', () => {
    const onPageChange = jest.fn();
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { PortalSite: { houses: makeHouses(30) } }
    });

    act(() => {
      root.render(
        <Paginator
          {...defaultProps}
          onPageChange={onPageChange}
          activePage={0}
        />
      );
    });

    // Click on page "2" button (index 1 in page buttons, skipping prev)
    const pageButtons =
      container.querySelectorAll<HTMLButtonElement>('[data-page-button]');
    act(() => {
      pageButtons[1].click(); // page index 1 → page 2
    });

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with activePage + 1 when next is clicked', () => {
    const onPageChange = jest.fn();
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { PortalSite: { houses: makeHouses(30) } }
    });

    act(() => {
      root.render(
        <Paginator
          {...defaultProps}
          onPageChange={onPageChange}
          activePage={0}
        />
      );
    });

    const nextBtn = container.querySelector<HTMLButtonElement>(
      '.bu-pagination li:last-child button'
    );
    act(() => {
      nextBtn!.click();
    });

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('marks the active page with class "selected" and aria-current="page"', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { PortalSite: { houses: makeHouses(30) } }
    });

    act(() => {
      root.render(<Paginator {...defaultProps} activePage={1} />);
    });

    const selectedItem = container.querySelector('.bu-pagination li.selected');
    expect(selectedItem).not.toBeNull();
    const btn = selectedItem?.querySelector('button');
    expect(btn?.getAttribute('aria-current')).toBe('page');
  });

  it('renders ellipsis for large page counts', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { PortalSite: { houses: makeHouses(200) } }
    });

    act(() => {
      root.render(<Paginator {...defaultProps} limit={10} activePage={10} />);
    });

    expect(container.textContent).toContain('...');
  });
});
