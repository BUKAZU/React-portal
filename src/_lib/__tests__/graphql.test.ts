import {
  graphqlMutation,
  GRAPHQL_MUTATION_MAX_RETRY_ATTEMPTS
} from '../graphql';

// Mock the global fetch
const mockFetch = jest.fn();
let originalFetch: typeof globalThis.fetch | undefined;

describe('graphqlMutation', () => {
  const mockUrl = 'https://test-api.com/graphql';
  const mockQuery = 'mutation { test }';
  const mockVariables = { id: 1 };
  const mockHeaders = { Authorization: 'Bearer token' };

  beforeAll(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch as unknown as typeof globalThis.fetch;
  });

  afterAll(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).fetch;
    }
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should make a successful GraphQL mutation request', async () => {
    // Mock successful response
    const mockData = { test: { id: 1, name: 'Test' } };
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: mockData })
    };
    mockFetch.mockResolvedValueOnce(mockResponse as any);

    // Call the function
    const result = await graphqlMutation({
      url: mockUrl,
      query: mockQuery,
      variables: mockVariables,
      headers: mockHeaders
    });

    // Verify the fetch was called correctly
    expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...mockHeaders
      },
      body: JSON.stringify({
        query: mockQuery,
        variables: mockVariables
      })
    });

    // Verify the response
    expect(result).toEqual(mockData);
  });

  it('should handle GraphQL errors', async () => {
    // Mock GraphQL error response
    const mockError = { message: 'Test error' };
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        errors: [mockError],
        data: null
      })
    };
    mockFetch.mockResolvedValueOnce(mockResponse as any);

    // Verify the error is thrown
    await expect(
      graphqlMutation({
        url: mockUrl,
        query: mockQuery
      })
    ).rejects.toThrow('GraphQL Error: Test error');
  });

  it('should handle HTTP errors', async () => {
    // Mock HTTP error response
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    };
    mockFetch.mockResolvedValueOnce(mockResponse as any);

    // Verify the error is thrown
    await expect(
      graphqlMutation({
        url: mockUrl,
        query: mockQuery
      })
    ).rejects.toThrow('HTTP error! status: 500');
  });

  it('should use default URL when not provided', async () => {
    // Mock successful response
    const mockData = { test: true };
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: mockData })
    };
    mockFetch.mockResolvedValueOnce(mockResponse as any);

    // Call without URL
    await graphqlMutation({
      query: mockQuery
    });

    // Should use default URL
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.bukazu.com/graphql',
      expect.anything()
    );
  });

  it('should handle network errors', async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Verify the error is thrown
    await expect(
      graphqlMutation({
        url: mockUrl,
        query: mockQuery
      })
    ).rejects.toThrow('GraphQL mutation failed: Network error');
  });

  describe('retry on connection failure (TypeError)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('exposes GRAPHQL_MUTATION_MAX_RETRY_ATTEMPTS as a positive integer', () => {
      expect(typeof GRAPHQL_MUTATION_MAX_RETRY_ATTEMPTS).toBe('number');
      expect(GRAPHQL_MUTATION_MAX_RETRY_ATTEMPTS).toBeGreaterThan(0);
      expect(Number.isInteger(GRAPHQL_MUTATION_MAX_RETRY_ATTEMPTS)).toBe(true);
    });

    it('retries and succeeds when fetch fails with TypeError then recovers', async () => {
      const mockData = { test: true };
      const successResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: mockData })
      };

      // Fail twice with a connection-level TypeError, then succeed
      mockFetch
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(successResponse as any);

      const promise = graphqlMutation({ url: mockUrl, query: mockQuery });
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('throws after exhausting all retry attempts', async () => {
      // Always fail with a connection-level TypeError
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      const promise = graphqlMutation({ url: mockUrl, query: mockQuery });
      // Attach the rejection handler immediately to prevent unhandled-rejection warnings
      const assertion = expect(promise).rejects.toThrow(
        'GraphQL mutation failed: Failed to fetch'
      );
      await jest.runAllTimersAsync();
      await assertion;

      // Initial attempt + GRAPHQL_MUTATION_MAX_RETRY_ATTEMPTS retries
      expect(mockFetch).toHaveBeenCalledTimes(
        GRAPHQL_MUTATION_MAX_RETRY_ATTEMPTS + 1
      );
    });

    it('does not retry on non-connection errors (plain Error)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Some non-network error'));

      const promise = graphqlMutation({ url: mockUrl, query: mockQuery });
      const assertion = expect(promise).rejects.toThrow(
        'GraphQL mutation failed: Some non-network error'
      );
      await jest.runAllTimersAsync();
      await assertion;

      // Only one attempt — plain Error is not retried
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('does not retry on GraphQL application errors', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest
          .fn()
          .mockResolvedValue({ errors: [{ message: 'Bad input' }], data: null })
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const promise = graphqlMutation({ url: mockUrl, query: mockQuery });
      const assertion = expect(promise).rejects.toThrow(
        'GraphQL Error: Bad input'
      );
      await jest.runAllTimersAsync();
      await assertion;

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('does not retry on HTTP errors', async () => {
      const mockResponse = { ok: false, status: 503 };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const promise = graphqlMutation({ url: mockUrl, query: mockQuery });
      const assertion = expect(promise).rejects.toThrow(
        'HTTP error! status: 503'
      );
      await jest.runAllTimersAsync();
      await assertion;

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
