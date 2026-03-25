import React, { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { ApiError } from '../Error';
import Loading from '../icons/loading.svg';
import { loadReviewsHouse, type ReviewsHouse } from './ReviewsPage';
import { createReviewsPageView } from './ReviewsPageView';

interface Props {
  objectCode: string;
  portalCode: string;
  locale: string;
}

type ReviewsPageState =
  | { status: 'loading' }
  | { status: 'error'; error: ApolloError }
  | { status: 'ready'; house: ReviewsHouse };

function toApolloError(error: unknown): ApolloError {
  if (error instanceof ApolloError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : 'Failed to load reviews data';

  return new ApolloError({
    graphQLErrors: [new GraphQLError(message)]
  });
}

function ReviewsPageDom({ house }: { house: ReviewsHouse }): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    containerRef.current.replaceChildren(createReviewsPageView(house));

    return () => {
      containerRef.current?.replaceChildren();
    };
  }, [house]);

  return <div ref={containerRef} />;
}

function ReviewsPageMount({ objectCode, portalCode, locale }: Props): JSX.Element {
  const [state, setState] = useState<ReviewsPageState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;
    setState({ status: 'loading' });

    void loadReviewsHouse({ portalCode, objectCode, locale })
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
  }, [portalCode, objectCode, locale]);

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
