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

jest.mock('../../Error', () => ({
  ApiError: ({ errors }: { errors: any }) => (
    <div data-testid="api-error">{errors.message}</div>
  )
}));

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
    criteria: review.reviewCriteria.map((c: any) => ({
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
    root.render(
      <ReviewsPageMount objectCode="HOUSE1" portalCode="PORTAL1" locale="en" />
    );
  });
}

const mockReviews = [
  {
    id: '1',
    name: 'Alice',
    review: 'Great place!',
    score: 9,
    createdAt: '2024-01-15',
    reviewCriteria: [{ id: 1, name: 'Cleanliness', score: 9 }]
  },
  {
    id: '2',
    name: 'Bob',
    review: 'Nice stay',
    score: 8,
    createdAt: '2024-02-20',
    reviewCriteria: [{ id: 2, name: 'Location', score: 8 }]
  }
];

const mockData = {
  PortalSite: {
    houses: [
      {
        id: 'h1',
        name: 'Test House',
        rating: 8.5,
        scoreAmount: 42,
        reviews: mockReviews
      }
    ]
  }
};

describe('ReviewsPage', () => {
  beforeEach(() => {
    mockedCreateReviewsPageView.mockImplementation((house) => {
      const element = document.createElement('div');
      element.className = 'bu_reviews';

      const heading = document.createElement('div');
      heading.textContent = `${house.scoreAmount} reviews`;
      element.appendChild(heading);

      house.reviews.forEach((review) => {
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

    expect(container.querySelector('[data-testid="api-error"]')).not.toBeNull();
    expect(container.textContent).toContain('Something went wrong');
  });

  it('renders reviews overview with score and count', async () => {
    mockedLoadReviewsHouse.mockResolvedValue(mockData.PortalSite.houses[0]);

    await renderPage();

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockedCreateReviewsPageView).toHaveBeenCalledWith(
      mockData.PortalSite.houses[0]
    );
    expect(container.textContent).toContain('42');
    expect(container.textContent).toContain('reviews');
  });

  it('renders all reviews', async () => {
    mockedLoadReviewsHouse.mockResolvedValue(mockData.PortalSite.houses[0]);

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
    mockedLoadReviewsHouse.mockResolvedValue(mockData.PortalSite.houses[0]);

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

    expect(mockedLoadReviewsHouse).toHaveBeenCalledWith({
      portalCode: 'PORTAL1',
      objectCode: 'HOUSE1',
      locale: 'en'
    });
  });
});
