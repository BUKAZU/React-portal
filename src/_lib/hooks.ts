import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { print, DocumentNode } from 'graphql';
import { TypedDocumentNode } from 'graphql-request';
import { getClient } from './graphqlClient';

interface UseQueryOptions {
  variables?: Record<string, unknown>;
  fetchPolicy?: string;
}

interface UseQueryResult<T> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
}

export function useQuery<T = Record<string, unknown>>(
  query: TypedDocumentNode<T, Record<string, unknown>>,
  options?: UseQueryOptions
): UseQueryResult<T> {
  const variables = options?.variables ?? {};
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // Stable key from actual variable values (new object references won't re-trigger)
  const variablesKey = useMemo(
    () => JSON.stringify(variables),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(variables)]
  );

  // Stable printed query string — query documents are module-level constants so
  // this ref rarely changes; printing is deferred to avoid per-render cost.
  const queryStringRef = useRef<string | null>(null);
  if (queryStringRef.current === null) {
    queryStringRef.current = print(query as DocumentNode);
  }
  const queryString = queryStringRef.current;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getClient()
      .request<T>(query, variables)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString, variablesKey]);

  return { data, error, loading };
}

interface MutationState<T> {
  loading: boolean;
  error: Error | null;
  data: T | undefined;
  reset: () => void;
}

type MutateFn<T> = (options?: { variables?: Record<string, unknown> }) => Promise<T>;

export function useMutation<T = Record<string, unknown>>(
  mutation: TypedDocumentNode<T, Record<string, unknown>>
): [MutateFn<T>, MutationState<T>] {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | undefined>(undefined);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(undefined);
  }, []);

  const mutate: MutateFn<T> = useCallback(
    (options?: { variables?: Record<string, unknown> }) => {
      setLoading(true);
      setError(null);
      return getClient()
        .request<T>(mutation, options?.variables ?? {})
        .then((result) => {
          setData(result);
          setLoading(false);
          return result;
        })
        .catch((err: Error) => {
          setError(err);
          setLoading(false);
          throw err;
        });
    },
    [mutation]
  );

  return [mutate, { loading, error, data, reset }];
}
