import React, { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { toApolloError } from '../../_lib/graphql_request';
import { mountPlainNode } from '../../_lib/plain_mount';
import { ApiError } from '../Error';
import Loading from '../icons/loading.svg';
import { loadReviewsHouse, type ReviewsHouse } from './ReviewsPage';
import { createReviewsPageView } from './ReviewsPageView';

interface Props {
  objectCode: string;
  portalCode: string;
}

type ReviewsPageState =
  | { status: 'loading' }
  | { status: 'error'; error: ApolloError }
  | { status: 'ready'; house: ReviewsHouse };

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

function ReviewsPageMount({
  objectCode,
  portalCode
}: Props): JSX.Element {
  const [state, setState] = useState<ReviewsPageState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;
    setState({ status: 'loading' });

    void loadReviewsHouse({ portalCode, objectCode })
      .then((house) => {
        if (!isMounted) {
          return;
        }
        setState({ status: 'ready', house });
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }
        setState({ status: 'error', error: toApolloError(error) });
      });

    return () => {
      isMounted = false;
    };
  }, [portalCode, objectCode]);

  if (state.status === 'loading') {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (state.status === 'error') {
    return <ApiError errors={state.error} />;
  }

  return <ReviewsPageDom house={state.house} />;
}

export default ReviewsPageMount;
