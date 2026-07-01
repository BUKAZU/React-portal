import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import ReviewsPageMount from '../ReviewsPageMount';
import { loadReviewsHouse } from '../ReviewsPage';
import { createReviewsPageView } from '../ReviewsPageView';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../intl', () => ({
  t: (id: string) => id
}));

jest.mock('../../icons/loading.svg', () => () => <svg data-testid="loading" />);

jest.mock('../Score', () => ({
  getScore: (rating: number) => ({
    color: 'best',
    formatted: rating.toFixed(1)
  })
}));

jest.mock('../SingleReview', () => ({
  processReview: (review: any) => ({
    id: review.id,
    name: review.name,
    createdAt: review.createdAt,
    review: review.review,
    color: 'best',
    formatted: review.score.toFixed(1),
    sourceName: review.sourceName ?? '',
    reviewResponses: review.reviewResponses ?? [],
    criteria: (review.reviewCriteria ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      score: c.score,
      color: 'best',
      formatted: c.score.toFixed(1)
    }))
  })
}));

jest.mock('../ReviewsPage', () => ({
  loadReviewsHouse: jest.fn()
}));

jest.mock('../ReviewsPageView', () => ({
  createReviewsPageView: jest.fn()
}));

const mockedLoadReviewsHouse = loadReviewsHouse as jest.Mock;
const mockedCreateReviewsPageView = createReviewsPageView as jest.Mock;

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

async function renderPage() {
  await act(async () => {
    root.render(<ReviewsPageMount objectCode="HOUSE1" portalCode="PORTAL1" />);
  });
}

const mockReviews = [
  {
    id: '1',
    name: 'Alice',
    review: 'Great place!',
    score: 9,
    createdAt: '2024-01-15',
    sourceName: '',
    reviewResponses: [],
    reviewCriteria: [{ id: 1, name: 'Cleanliness', score: 9 }]
  },
  {
    id: '2',
    name: 'Bob',
    review: 'Nice stay',
    score: 8,
    createdAt: '2024-02-20',
    sourceName: 'Booking.com',
    reviewResponses: [],
    reviewCriteria: [{ id: 2, name: 'Location', score: 8 }]
  }
];

const mockHouse = {
  id: 'h1',
  name: 'Test House',
  rating: 8.5,
  scoreAmount: 42,
  reviews: mockReviews
};

const mockPageInfo = {
  start_cursor: 'cursor1',
  end_cursor: 'cursor2',
  has_next_page: false,
  has_previous_page: false
};

const mockResult = { house: mockHouse, pageInfo: mockPageInfo };

describe('ReviewsPage', () => {
  beforeEach(() => {
    mockedCreateReviewsPageView.mockImplementation((house) => {
      const element = document.createElement('div');
      element.className = 'bu_reviews';

      const heading = document.createElement('div');
      heading.textContent = `${house.scoreAmount} reviews`;
      element.appendChild(heading);

      house.reviews.forEach((review: any) => {
        const item = document.createElement('div');
        item.className = 'bu_single_review';
        item.textContent = review.name;
        element.appendChild(item);
      });

      const note = document.createElement('div');
      note.setAttribute('data-testid', 'note');
      element.appendChild(note);

      return element;
    });
  });

  it('renders loading state while waiting for data', async () => {
    mockedLoadReviewsHouse.mockImplementation(
      () => new Promise(() => undefined)
    );

    await renderPage();

    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
  });

  it('renders error state', async () => {
    mockedLoadReviewsHouse.mockRejectedValue(new Error('Something went wrong'));

    await renderPage();

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('[data-testid="error"]')).not.toBeNull();
    expect(container.textContent).toContain('something_went_wrong_please_try_again');
  });

  it('renders reviews overview with score and count', async () => {
    mockedLoadReviewsHouse.mockResolvedValue(mockResult);

    await renderPage();

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedCreateReviewsPageView).toHaveBeenCalledWith(mockHouse);
    expect(container.textContent).toContain('42');
    expect(container.textContent).toContain('reviews');
  });

  it('renders all reviews', async () => {
    mockedLoadReviewsHouse.mockResolvedValue(mockResult);

    await renderPage();

    await act(async () => {
      await Promise.resolve();
    });

    const reviews = container.querySelectorAll('.bu_single_review');
    expect(reviews).toHaveLength(2);
    expect(reviews[0].textContent).toContain('Alice');
    expect(reviews[1].textContent).toContain('Bob');
  });

  it('renders the note component', async () => {
    mockedLoadReviewsHouse.mockResolvedValue(mockResult);

    await renderPage();

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('[data-testid="note"]')).not.toBeNull();
  });

  it('passes correct variables to the reviews loader', async () => {
    mockedLoadReviewsHouse.mockImplementation(
      () => new Promise(() => undefined)
    );

    await renderPage();

    expect(mockedLoadReviewsHouse).toHaveBeenCalledWith(
      expect.objectContaining({
        portalCode: 'PORTAL1',
        objectCode: 'HOUSE1'
      })
    );
  });

  it('shows Load More button when hasNextPage is true', async () => {
    const withNextPage = {
      ...mockResult,
      pageInfo: { ...mockPageInfo, has_next_page: true, end_cursor: 'nextCursor' }
    };
    mockedLoadReviewsHouse.mockResolvedValue(withNextPage);

    await renderPage();
    await act(async () => { await Promise.resolve(); });

    expect(container.querySelector('.bu_load_more')).not.toBeNull();
    expect(container.textContent).toContain('load_more_reviews');
  });

  it('does not show Load More button when hasNextPage is false', async () => {
    mockedLoadReviewsHouse.mockResolvedValue(mockResult);

    await renderPage();
    await act(async () => { await Promise.resolve(); });

    expect(container.querySelector('.bu_load_more')).toBeNull();
  });

  it('loads next page and appends reviews on Load More click', async () => {
    const firstPage = {
      house: { ...mockHouse, reviews: [mockReviews[0]] },
      pageInfo: { ...mockPageInfo, has_next_page: true, end_cursor: 'cursor2' }
    };
    const secondPage = {
      house: { ...mockHouse, reviews: [mockReviews[1]] },
      pageInfo: { ...mockPageInfo, has_next_page: false, end_cursor: null }
    };

    mockedLoadReviewsHouse
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage);

    await renderPage();
    await act(async () => { await Promise.resolve(); });

    const loadMoreButton = container.querySelector('.bu_load_more') as HTMLButtonElement;
    expect(loadMoreButton).not.toBeNull();

    await act(async () => {
      loadMoreButton.click();
      await Promise.resolve();
    });

    expect(mockedLoadReviewsHouse).toHaveBeenCalledWith(
      expect.objectContaining({ after: 'cursor2' })
    );

    expect(mockedCreateReviewsPageView).toHaveBeenLastCalledWith(
      expect.objectContaining({
        reviews: expect.arrayContaining([
          expect.objectContaining({ name: 'Alice' }),
          expect.objectContaining({ name: 'Bob' })
        ])
      })
    );

    expect(container.querySelector('.bu_load_more')).toBeNull();
  });

  it('passes apiUrl to the reviews loader', async () => {
    mockedLoadReviewsHouse.mockImplementation(() => new Promise(() => undefined));

    await act(async () => {
      root.render(<ReviewsPageMount objectCode="HOUSE1" portalCode="PORTAL1" apiUrl="https://api.example.com" />);
    });

    expect(mockedLoadReviewsHouse).toHaveBeenCalledWith(
      expect.objectContaining({ apiUrl: 'https://api.example.com' })
    );
  });

  it('shows loading spinner and hides Load More button while loading more', async () => {
    const firstPage = {
      house: { ...mockHouse, reviews: [mockReviews[0]] },
      pageInfo: { ...mockPageInfo, has_next_page: true, end_cursor: 'cursor2' }
    };

    mockedLoadReviewsHouse
      .mockResolvedValueOnce(firstPage)
      .mockReturnValueOnce(new Promise(() => undefined));

    await renderPage();
    await act(async () => { await Promise.resolve(); });

    const loadMoreButton = container.querySelector('.bu_load_more') as HTMLButtonElement;
    act(() => { loadMoreButton.click(); });

    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
    expect(container.querySelector('.bu_load_more')).toBeNull();
  });

  it('does not update state after unmount during initial load', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    let resolveLoad!: (value: typeof mockResult) => void;
    mockedLoadReviewsHouse.mockReturnValue(new Promise(resolve => { resolveLoad = resolve; }));

    await renderPage();
    act(() => { root.unmount(); });

    await act(async () => {
      resolveLoad(mockResult);
      await Promise.resolve();
    });

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('does not update state after unmount during load more', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const firstPage = {
      house: { ...mockHouse, reviews: [mockReviews[0]] },
      pageInfo: { ...mockPageInfo, has_next_page: true, end_cursor: 'cursor2' }
    };

    let resolveSecondPage!: (value: typeof mockResult) => void;
    mockedLoadReviewsHouse
      .mockResolvedValueOnce(firstPage)
      .mockReturnValueOnce(new Promise(resolve => { resolveSecondPage = resolve; }));

    await renderPage();
    await act(async () => { await Promise.resolve(); });

    const loadMoreButton = container.querySelector('.bu_load_more') as HTMLButtonElement;
    act(() => { loadMoreButton.click(); });
    act(() => { root.unmount(); });

    await act(async () => {
      resolveSecondPage(mockResult);
      await Promise.resolve();
    });

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('shows error state when Load More request fails', async () => {
    const firstPage = {
      house: { ...mockHouse, reviews: [mockReviews[0]] },
      pageInfo: { ...mockPageInfo, has_next_page: true, end_cursor: 'cursor2' }
    };

    mockedLoadReviewsHouse
      .mockResolvedValueOnce(firstPage)
      .mockRejectedValueOnce(new Error('Network failure'));

    await renderPage();
    await act(async () => { await Promise.resolve(); });

    const loadMoreButton = container.querySelector('.bu_load_more') as HTMLButtonElement;
    expect(loadMoreButton).not.toBeNull();

    await act(async () => {
      loadMoreButton.click();
      await Promise.resolve();
    });

    expect(container.querySelector('[data-testid="error"]')).not.toBeNull();
    expect(container.textContent).toContain('something_went_wrong_please_try_again');
  });

  it('wraps non-Error rejections in Error on Load More failure', async () => {
    const firstPage = {
      house: { ...mockHouse, reviews: [mockReviews[0]] },
      pageInfo: { ...mockPageInfo, has_next_page: true, end_cursor: 'cursor2' }
    };

    mockedLoadReviewsHouse
      .mockResolvedValueOnce(firstPage)
      .mockRejectedValueOnce('plain string error');

    await renderPage();
    await act(async () => { await Promise.resolve(); });

    const loadMoreButton = container.querySelector('.bu_load_more') as HTMLButtonElement;
    await act(async () => {
      loadMoreButton.click();
      await Promise.resolve();
    });

    expect(container.querySelector('[data-testid="error"]')).not.toBeNull();
  });
});
