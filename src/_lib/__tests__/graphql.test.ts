import { graphqlMutation } from '../graphql';
import { HTTPError } from 'ky';

// Mock the shared http client so tests do not hit the network.
jest.mock('../http_client', () => ({
  http: { get: jest.fn(), post: jest.fn() }
}));
import { http } from '../http_client';

const mockHttp = http as jest.Mocked<typeof http>;

describe('graphqlMutation', () => {
  const mockUrl = 'https://test-api.com/graphql';
  const mockQuery = 'mutation { test }';
  const mockVariables = { id: 1 };
  const mockHeaders = { Authorization: '******' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a successful GraphQL mutation request', async () => {
    const mockData = { test: { id: 1, name: 'Test' } };
    (mockHttp.post as jest.Mock).mockReturnValue({
      json: jest.fn().mockResolvedValue({ data: mockData })
    });

    const result = await graphqlMutation({
      url: mockUrl,
      query: mockQuery,
      variables: mockVariables,
      headers: mockHeaders
    });

    expect(result).toEqual(mockData);

    const [calledUrl, calledOptions] = (mockHttp.post as jest.Mock).mock
      .calls[0];
    expect(calledUrl).toBe(mockUrl);
    expect(calledOptions.json).toEqual({
      query: mockQuery,
      variables: mockVariables
    });
    expect(calledOptions.headers).toEqual(mockHeaders);
  });

  it('should handle GraphQL errors', async () => {
    (mockHttp.post as jest.Mock).mockReturnValue({
      json: jest.fn().mockResolvedValue({
        errors: [{ message: 'Test error' }],
        data: null
      })
    });

    await expect(
      graphqlMutation({ url: mockUrl, query: mockQuery })
    ).rejects.toThrow('GraphQL Error: Test error');
  });

  it('should translate an HTTPError into a plain Error with the status code', async () => {
    const fakeResponse = { status: 500 } as Response;
    const fakeRequest = { method: 'POST', url: mockUrl } as Request;
    const httpError = new HTTPError(fakeResponse, fakeRequest, {} as never);

    (mockHttp.post as jest.Mock).mockReturnValue({
      json: jest.fn().mockRejectedValue(httpError)
    });

    await expect(
      graphqlMutation({ url: mockUrl, query: mockQuery })
    ).rejects.toThrow('HTTP error! status: 500');
  });

  it('should use default URL when not provided', async () => {
    (mockHttp.post as jest.Mock).mockReturnValue({
      json: jest.fn().mockResolvedValue({ data: { ok: true } })
    });

    await graphqlMutation({ query: mockQuery });

    expect((mockHttp.post as jest.Mock).mock.calls[0][0]).toBe(
      'https://api.bukazu.com/graphql'
    );
  });

  it('should wrap a generic network error as a GraphQL mutation failure', async () => {
    (mockHttp.post as jest.Mock).mockReturnValue({
      json: jest.fn().mockRejectedValue(new Error('Network error'))
    });

    await expect(
      graphqlMutation({ url: mockUrl, query: mockQuery })
    ).rejects.toThrow('GraphQL mutation failed: Network error');
  });

  it('should handle multiple GraphQL errors joined by newline', async () => {
    (mockHttp.post as jest.Mock).mockReturnValue({
      json: jest.fn().mockResolvedValue({
        errors: [{ message: 'Error one' }, { message: 'Error two' }],
        data: null
      })
    });

    await expect(
      graphqlMutation({ url: mockUrl, query: mockQuery })
    ).rejects.toThrow('GraphQL Error: Error one\nError two');
  });
});
