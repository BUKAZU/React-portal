import { GraphQLClient } from 'graphql-request';
import { GraphQLError } from 'graphql';
import { createGraphQLRequestClient, toGraphQLErrors } from '../graphql_request';

jest.mock('graphql-request', () => ({
  GraphQLClient: jest.fn()
}));

type MockedClientCtor = jest.MockedClass<typeof GraphQLClient>;
const mockedGraphQLClient = GraphQLClient as MockedClientCtor;

describe('graphql_request helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a client from explicit apiUrl and locale', () => {
    createGraphQLRequestClient('https://api.bukazu.com/graphql', 'en');

    expect(mockedGraphQLClient).toHaveBeenCalledWith(
      'https://api.bukazu.com/graphql',
      {
        headers: {
          locale: 'en'
        }
      }
    );
  });

  it('creates a client with a custom apiUrl and locale', () => {
    createGraphQLRequestClient('https://custom.example/graphql', 'nl');

    expect(mockedGraphQLClient).toHaveBeenCalledWith(
      'https://custom.example/graphql',
      {
        headers: {
          locale: 'nl'
        }
      }
    );
  });

  it('maps unknown errors to GraphQLErrors', () => {
    const error = toGraphQLErrors(new Error('boom'));

    expect(error[0].message).toBe('boom');
  });

  it('returns GraphQLErrors from a GraphQL response error', () => {
    const graphQLError = new GraphQLError('resolver failed');

    const errors = toGraphQLErrors({
      response: { errors: [graphQLError] }
    });

    expect(errors).toEqual([graphQLError]);
  });
});
