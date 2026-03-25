import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useQuery } from '@apollo/client';
import ReviewsPage from '../ReviewsPage';
import { AppContext } from '../../AppContext';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('@apollo/client', () => ({
  useQuery: jest.fn()
}));

jest.mock('../../../_lib/gql', () => ({
  REVIEWS_QUERY: 'REVIEWS_QUERY'
}));

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
  getScore: (rating: number) => ({ color: 'best', formatted: rating.toFixed(1) })
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

jest.mock('../note', () => () => <div data-testid="note" />);

const mockedUseQuery = useQuery as jest.Mock;

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

function renderWithContext() {
  act(() => {
    root.render(
      <AppContext.Provider
        value={{ locale: 'en', portalCode: 'PORTAL1', objectCode: 'HOUSE1' }}
      >
        <ReviewsPage />
      </AppContext.Provider>
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
  it('renders loading state', () => {
    mockedUseQuery.mockReturnValue({ loading: true, error: undefined, data: undefined });

    renderWithContext();

    expect(container.querySelector('[data-testid="loading"]')).not.toBeNull();
  });

  it('renders error state', () => {
    mockedUseQuery.mockReturnValue({
      loading: false,
      error: { message: 'Something went wrong' },
      data: undefined
    });

    renderWithContext();

    expect(container.querySelector('[data-testid="api-error"]')).not.toBeNull();
    expect(container.textContent).toContain('Something went wrong');
  });

  it('renders reviews overview with score and count', () => {
    mockedUseQuery.mockReturnValue({ loading: false, error: undefined, data: mockData });

    renderWithContext();

    expect(container.querySelector('.bu_score')).not.toBeNull();
    expect(container.textContent).toContain('8.5');
    expect(container.textContent).toContain('42');
    expect(container.textContent).toContain('reviews');
  });

  it('renders all reviews', () => {
    mockedUseQuery.mockReturnValue({ loading: false, error: undefined, data: mockData });

    renderWithContext();

    const reviews = container.querySelectorAll('.bu_single_review');
    expect(reviews).toHaveLength(2);
    expect(reviews[0].textContent).toContain('Alice');
    expect(reviews[1].textContent).toContain('Bob');
  });

  it('renders the note component', () => {
    mockedUseQuery.mockReturnValue({ loading: false, error: undefined, data: mockData });

    renderWithContext();

    expect(container.querySelector('[data-testid="note"]')).not.toBeNull();
  });

  it('passes correct variables to useQuery', () => {
    mockedUseQuery.mockReturnValue({ loading: true, error: undefined, data: undefined });

    renderWithContext();

    expect(mockedUseQuery).toHaveBeenCalledWith('REVIEWS_QUERY', {
      variables: { id: 'PORTAL1', house_id: 'HOUSE1' }
    });
  });
});
