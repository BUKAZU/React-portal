import {
  validate,
  buildClientSchema,
  GraphQLSchema,
  DocumentNode
} from 'graphql';
import {
  CREATE_BOOKING_MUTATION,
  SINGLE_HOUSE_QUERY,
  HOUSES_QUERY,
  HOUSE_COUNT_QUERY,
  CHECK_DISCOUNT_CODE,
  HOUSE_SEARCH_RESULT_FIELDS
} from '../gql';
import introspectionResult from './schema.json';

const allQueries: Array<{ name: string; document: DocumentNode }> = [
  { name: 'CREATE_BOOKING_MUTATION', document: CREATE_BOOKING_MUTATION },
  { name: 'SINGLE_HOUSE_QUERY', document: SINGLE_HOUSE_QUERY },
  { name: 'HOUSES_QUERY', document: HOUSES_QUERY },
  { name: 'HOUSE_COUNT_QUERY', document: HOUSE_COUNT_QUERY },
  { name: 'CHECK_DISCOUNT_CODE', document: CHECK_DISCOUNT_CODE }
];

const allFragments: Array<{ name: string; document: DocumentNode }> = [
  { name: 'HOUSE_SEARCH_RESULT_FIELDS', document: HOUSE_SEARCH_RESULT_FIELDS }
];

describe('GraphQL queries comply with API schema', () => {
  let schema: GraphQLSchema;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema = buildClientSchema(introspectionResult as any);
  });

  describe('query documents are syntactically valid', () => {
    it.each(allQueries)(
      '$name is a valid GraphQL document',
      ({ document }: { name: string; document: DocumentNode }) => {
        expect(document).toBeDefined();
        expect(document.kind).toBe('Document');
        expect(document.definitions.length).toBeGreaterThan(0);
      }
    );
  });

  describe('fragment documents are syntactically valid', () => {
    it.each(allFragments)(
      '$name is a valid GraphQL fragment document',
      ({ document }: { name: string; document: DocumentNode }) => {
        expect(document).toBeDefined();
        expect(document.kind).toBe('Document');
        expect(document.definitions.length).toBeGreaterThan(0);
      }
    );
  });

  it('all queries are semantically valid against the API schema', () => {
    for (const { name, document } of allQueries) {
      const errors = validate(schema, document);
      if (errors.length > 0) {
        const message = `${name} has schema validation errors: ${errors
          .map((e) => e.message)
          .join(', ')}`;
        throw new Error(message);
      }
      expect(errors).toHaveLength(0);
    }
  });
});
