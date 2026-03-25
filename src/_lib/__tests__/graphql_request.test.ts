import { GraphQLClient } from 'graphql-request';
import {
  createGraphQLRequestClient,
  requestGraphQL,
  setGraphQLRequestConfig,
  toApolloError
} from '../graphql_request';

jest.mock('graphql-request', () => ({
  GraphQLClient: jest.fn()
}));

type MockedClientCtor = jest.MockedClass<typeof GraphQLClient>;
const mockedGraphQLClient = GraphQLClient as MockedClientCtor;

describe('graphql_request helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setGraphQLRequestConfig({
      apiUrl: 'https://api.bukazu.com/graphql',
      locale: 'en',
      headers: {}
    });
  });

  it('creates a client from centralized config', () => {
    createGraphQLRequestClient();

    expect(mockedGraphQLClient).toHaveBeenCalledWith(
      'https://api.bukazu.com/graphql',
      {
        headers: {
          locale: 'en'
        }
      }
    );
  });

  it('requests data using current config and variables', async () => {
    const request = jest.fn().mockResolvedValue({ PortalSite: { id: 'x' } });
    mockedGraphQLClient.mockImplementation(
      () =>
        ({
          request
        }) as unknown as GraphQLClient
    );

    setGraphQLRequestConfig({
      apiUrl: 'https://custom.example/graphql',
      locale: 'nl',
      headers: { authorization: 'Bearer token' }
    });

    const result = await requestGraphQL<{ PortalSite: { id: string } }>(
      'query Test($id: ID!) { PortalSite(id: $id) { id } }',
      { id: 'x' }
    );

    expect(mockedGraphQLClient).toHaveBeenCalledWith(
      'https://custom.example/graphql',
      {
        headers: {
          locale: 'nl',
          authorization: 'Bearer token'
        }
      }
    );
    expect(request).toHaveBeenCalledWith(
      'query Test($id: ID!) { PortalSite(id: $id) { id } }',
      { id: 'x' }
    );
    expect(result.PortalSite.id).toBe('x');
  });

  it('maps unknown errors to ApolloError', () => {
    const error = toApolloError(new Error('boom'));

    expect(error.graphQLErrors[0].message).toBe('boom');
  });
});
