import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useQuery, useMutation } from '../hooks';

// ---------------------------------------------------------------------------
// Mock graphqlClient so no real network requests are made
// ---------------------------------------------------------------------------
jest.mock('../graphqlClient', () => ({
  getClient: jest.fn()
}));

import { getClient } from '../graphqlClient';
const mockGetClient = getClient as jest.Mock;

// ---------------------------------------------------------------------------
// Mock the `print` function from graphql so tests don't need a real DocumentNode
// ---------------------------------------------------------------------------
jest.mock('graphql', () => ({
  ...jest.requireActual('graphql'),
  print: jest.fn((q: any) => String(q))
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const MOCK_QUERY = { kind: 'Document', definitions: [] } as any;
const MOCK_MUTATION = { kind: 'Document', definitions: [] } as any;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// useQuery tests
// ---------------------------------------------------------------------------

describe('useQuery', () => {
  it('starts with loading:true and no data/error', async () => {
    let resolve: (v: any) => void;
    mockGetClient.mockReturnValue({
      request: jest.fn(
        () => new Promise((res) => { resolve = res; })
      )
    });

    const results: Array<{ loading: boolean; data: any; error: any }> = [];

    function TestComponent() {
      const state = useQuery(MOCK_QUERY, { variables: { id: '1' } });
      results.push({ loading: state.loading, data: state.data, error: state.error });
      return null;
    }

    await act(async () => {
      root.render(<TestComponent />);
    });

    expect(results[0].loading).toBe(true);
    expect(results[0].data).toBeUndefined();
    expect(results[0].error).toBeNull();

    // resolve so no lingering promise after test
    await act(async () => { resolve({ ok: true }); });
  });

  it('transitions to data when request resolves', async () => {
    const responseData = { PortalSite: { id: '1' } };
    mockGetClient.mockReturnValue({
      request: jest.fn().mockResolvedValue(responseData)
    });

    const results: Array<{ loading: boolean; data: any; error: any }> = [];

    function TestComponent() {
      const state = useQuery(MOCK_QUERY, { variables: { id: '1' } });
      results.push({ loading: state.loading, data: state.data, error: state.error });
      return null;
    }

    await act(async () => {
      root.render(<TestComponent />);
    });

    const last = results[results.length - 1];
    expect(last.loading).toBe(false);
    expect(last.data).toEqual(responseData);
    expect(last.error).toBeNull();
  });

  it('transitions to error when request rejects', async () => {
    const requestError = new Error('Network error');
    mockGetClient.mockReturnValue({
      request: jest.fn().mockRejectedValue(requestError)
    });

    const results: Array<{ loading: boolean; data: any; error: any }> = [];

    function TestComponent() {
      const state = useQuery(MOCK_QUERY, { variables: { id: '1' } });
      results.push({ loading: state.loading, data: state.data, error: state.error });
      return null;
    }

    await act(async () => {
      root.render(<TestComponent />);
    });

    const last = results[results.length - 1];
    expect(last.loading).toBe(false);
    expect(last.error).toBe(requestError);
    expect(last.data).toBeUndefined();
  });

  it('does not re-fetch when variables object reference changes but values are the same', async () => {
    const mockRequest = jest.fn().mockResolvedValue({ data: 'ok' });
    mockGetClient.mockReturnValue({ request: mockRequest });

    function TestComponent({ id }: { id: string }) {
      // `variables` is a new object on every render but same value
      useQuery(MOCK_QUERY, { variables: { id } });
      return null;
    }

    await act(async () => {
      root.render(<TestComponent id="abc" />);
    });
    await act(async () => {
      root.render(<TestComponent id="abc" />);
    });

    // request should only have been called once despite two renders
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('re-fetches when variables values change', async () => {
    const mockRequest = jest.fn().mockResolvedValue({ data: 'ok' });
    mockGetClient.mockReturnValue({ request: mockRequest });

    function TestComponent({ id }: { id: string }) {
      useQuery(MOCK_QUERY, { variables: { id } });
      return null;
    }

    await act(async () => {
      root.render(<TestComponent id="abc" />);
    });
    await act(async () => {
      root.render(<TestComponent id="xyz" />);
    });

    expect(mockRequest).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// useMutation tests
// ---------------------------------------------------------------------------

describe('useMutation', () => {
  it('starts in idle state: loading false, no data, no error', () => {
    const results: Array<{ loading: boolean; data: any; error: any }> = [];
    const mutateFns: Array<Function> = [];

    function TestComponent() {
      const [mutate, state] = useMutation(MOCK_MUTATION);
      results.push({ loading: state.loading, data: state.data, error: state.error });
      mutateFns.push(mutate);
      return null;
    }

    act(() => { root.render(<TestComponent />); });

    expect(results[0].loading).toBe(false);
    expect(results[0].data).toBeUndefined();
    expect(results[0].error).toBeNull();
  });

  it('sets loading:true while mutation is in-flight, then sets data on success', async () => {
    const responseData = { createBooking: { booking_nr: 42 } };
    let resolveMutation: (v: any) => void;
    mockGetClient.mockReturnValue({
      request: jest.fn(
        () => new Promise((res) => { resolveMutation = res; })
      )
    });

    const results: Array<{ loading: boolean; data: any; error: any }> = [];
    let mutateFn: Function;

    function TestComponent() {
      const [mutate, state] = useMutation(MOCK_MUTATION);
      results.push({ loading: state.loading, data: state.data, error: state.error });
      mutateFn = mutate;
      return null;
    }

    act(() => { root.render(<TestComponent />); });

    // trigger mutation
    let mutatePromise: Promise<any>;
    act(() => { mutatePromise = mutateFn!({ variables: { code: 'X1' } }) as any; });

    // while in-flight, loading should be true
    expect(results[results.length - 1].loading).toBe(true);

    // resolve and flush
    await act(async () => { resolveMutation!(responseData); await mutatePromise; });

    const last = results[results.length - 1];
    expect(last.loading).toBe(false);
    expect(last.data).toEqual(responseData);
    expect(last.error).toBeNull();
  });

  it('sets error on mutation failure', async () => {
    const requestError = new Error('Mutation failed');
    mockGetClient.mockReturnValue({
      request: jest.fn().mockRejectedValue(requestError)
    });

    const results: Array<{ loading: boolean; data: any; error: any }> = [];
    let mutateFn: Function;

    function TestComponent() {
      const [mutate, state] = useMutation(MOCK_MUTATION);
      results.push({ loading: state.loading, data: state.data, error: state.error });
      mutateFn = mutate;
      return null;
    }

    act(() => { root.render(<TestComponent />); });

    await act(async () => {
      try {
        await mutateFn!({ variables: {} });
      } catch {
        // expected
      }
    });

    const last = results[results.length - 1];
    expect(last.loading).toBe(false);
    expect(last.error).toBe(requestError);
    expect(last.data).toBeUndefined();
  });

  it('reset() clears loading/error/data', async () => {
    const requestError = new Error('oops');
    mockGetClient.mockReturnValue({
      request: jest.fn().mockRejectedValue(requestError)
    });

    const results: Array<{ loading: boolean; data: any; error: any }> = [];
    let mutateFn: Function;
    let resetFn: Function;

    function TestComponent() {
      const [mutate, state] = useMutation(MOCK_MUTATION);
      results.push({ loading: state.loading, data: state.data, error: state.error });
      mutateFn = mutate;
      resetFn = state.reset;
      return null;
    }

    act(() => { root.render(<TestComponent />); });

    // trigger failing mutation
    await act(async () => {
      try { await mutateFn!({ variables: {} }); } catch { /* expected */ }
    });

    expect(results[results.length - 1].error).toBe(requestError);

    // reset should clear error
    act(() => { resetFn!(); });

    const last = results[results.length - 1];
    expect(last.loading).toBe(false);
    expect(last.error).toBeNull();
    expect(last.data).toBeUndefined();
  });
});
