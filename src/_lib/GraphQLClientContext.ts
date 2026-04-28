import { createContext } from 'react';
import { GraphQLClient } from 'graphql-request';
import { createGraphQLRequestClient } from './graphql_request';

export const GraphQLClientContext = createContext<GraphQLClient>(
  createGraphQLRequestClient('https://api.bukazu.com/graphql', 'en')
);
