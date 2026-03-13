import {
  useQuery as useQueryTanstack,
  useMutation as useMutationTanstack
} from '@tanstack/react-query';
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
  const { data, error, isLoading } = useQueryTanstack<T>({
    queryKey: [query, variables],
    queryFn: () => getClient().request<T>(query, variables)
  });
  return { data, error: error as Error | null, loading: isLoading };
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
  const { mutateAsync, isPending, error, data, reset } = useMutationTanstack<
    T,
    Error,
    Record<string, unknown>
  >({
    mutationFn: (variables: Record<string, unknown>) =>
      getClient().request<T>(mutation, variables)
  });

  const mutate: MutateFn<T> = (
    options?: { variables?: Record<string, unknown> }
  ) => mutateAsync(options?.variables ?? {});

  return [
    mutate,
    { loading: isPending, error: error as Error | null, data, reset }
  ];
}
