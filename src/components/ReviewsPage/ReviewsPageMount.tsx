import React, { useEffect, useRef, useState } from 'react';
import { t } from '../../intl';
import { mountPlainNode } from '../../_lib/plain_mount';
import Loading from '../icons/loading.svg';
import { loadReviewsHouse, type ReviewsHouse } from './ReviewsPage';
import { createReviewsPageView } from './ReviewsPageView';

interface Props {
  objectCode: string;
  portalCode: string;
  apiUrl?: string;
}

type ReviewsPageState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; house: ReviewsHouse; endCursor: string | null; hasNextPage: boolean }
  | { status: 'loading_more'; house: ReviewsHouse; endCursor: string | null };

function ReviewsPageDom({ house }: { house: ReviewsHouse }): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    return mountPlainNode(containerRef.current, () =>
      createReviewsPageView(house)
    );
  }, [house]);

  return <div ref={containerRef} />;
}

function ReviewsPageMount({ objectCode, portalCode, apiUrl }: Props): JSX.Element {
  const [state, setState] = useState<ReviewsPageState>({ status: 'loading' });
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setState({ status: 'loading' });

    void loadReviewsHouse({ portalCode, objectCode, apiUrl })
      .then(({ house, pageInfo }) => {
        if (!isMounted) return;
        setState({
          status: 'ready',
          house,
          endCursor: pageInfo.end_cursor,
          hasNextPage: pageInfo.has_next_page
        });
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error))
        });
      });

    return () => {
      isMounted = false;
    };
  }, [portalCode, objectCode, apiUrl]);

  function handleLoadMore() {
    if (state.status !== 'ready' || !state.hasNextPage) return;
    const currentHouse = state.house;
    const cursor = state.endCursor;
    setState({ status: 'loading_more', house: currentHouse, endCursor: cursor });

    void loadReviewsHouse({ portalCode, objectCode, apiUrl, after: cursor ?? undefined })
      .then(({ house: nextPage, pageInfo }) => {
        if (!mountedRef.current) return;
        setState({
          status: 'ready',
          house: { ...currentHouse, reviews: [...currentHouse.reviews, ...nextPage.reviews] },
          endCursor: pageInfo.end_cursor,
          hasNextPage: pageInfo.has_next_page
        });
      })
      .catch((error: unknown) => {
        if (!mountedRef.current) return;
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error))
        });
      });
  }

  if (state.status === 'loading') {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="bukazu-error-message" data-testid="error">
        <h2>{t('something_went_wrong_please_try_again')}</h2>
      </div>
    );
  }

  const house = state.house;
  const hasNextPage = state.status === 'ready' ? state.hasNextPage : false;
  const isLoadingMore = state.status === 'loading_more';

  return (
    <>
      <ReviewsPageDom house={house} />
      {isLoadingMore && (
        <div>
          <Loading />
        </div>
      )}
      {!isLoadingMore && hasNextPage && (
        <button className="bu_load_more" onClick={handleLoadMore}>
          {t('load_more_reviews')}
        </button>
      )}
      <div className="bu_reviews__note">
        <a href="https://www.bukazu.com" target="_blank" rel="noopener noreferrer">
          {t('reviews_note_link')}
        </a>
      </div>
    </>
  );
}

export default ReviewsPageMount;
