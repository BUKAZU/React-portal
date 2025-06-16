import { graphqlMutation } from '../graphql';

// Mock the global fetch
const mockFetch = jest.fn();
// @ts-ignore - We're mocking the global fetch
global.fetch = mockFetch;

describe('graphqlMutation', () => {
    const mockUrl = 'https://test-api.com/graphql';
    const mockQuery = 'mutation { test }';
    const mockVariables = { id: 1 };
    const mockHeaders = { 'Authorization': 'Bearer token' };

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
});
