import {
  validate,
  buildClientSchema,
  GraphQLSchema,
  DocumentNode
} from 'graphql';
import {
  PORTAL_QUERY,
  CALENDAR_QUERY,
  BOOKING_PRICE_QUERY,
  CREATE_BOOKING_MUTATION,
  SINGLE_HOUSE_QUERY,
  HOUSES_QUERY,
  HOUSES_PRICE_QUERY,
  HOUSE_COUNT_QUERY,
  BOOKING_PRICE_TOTAL_QUERY,
  PRICE_FIELD_BOOKING_PRICE_QUERY,
  REVIEWS_QUERY,
  CHECK_DISCOUNT_CODE,
  HOUSE_SEARCH_RESULT_FIELDS,
  BOOKING_FORM_LABEL_FIELDS,
  BOOKING_FORM_CONFIGURATION_FIELDS
} from '../gql';
import introspectionResult from './schema.json';

const allQueries: Array<{ name: string; document: DocumentNode }> = [
  { name: 'PORTAL_QUERY', document: PORTAL_QUERY },
  { name: 'CALENDAR_QUERY', document: CALENDAR_QUERY },
  { name: 'BOOKING_PRICE_QUERY', document: BOOKING_PRICE_QUERY },
  { name: 'CREATE_BOOKING_MUTATION', document: CREATE_BOOKING_MUTATION },
  { name: 'SINGLE_HOUSE_QUERY', document: SINGLE_HOUSE_QUERY },
  { name: 'HOUSES_QUERY', document: HOUSES_QUERY },
  { name: 'HOUSES_PRICE_QUERY', document: HOUSES_PRICE_QUERY },
  { name: 'HOUSE_COUNT_QUERY', document: HOUSE_COUNT_QUERY },
  { name: 'BOOKING_PRICE_TOTAL_QUERY', document: BOOKING_PRICE_TOTAL_QUERY },
  {
    name: 'PRICE_FIELD_BOOKING_PRICE_QUERY',
    document: PRICE_FIELD_BOOKING_PRICE_QUERY
  },
  { name: 'REVIEWS_QUERY', document: REVIEWS_QUERY },
  { name: 'CHECK_DISCOUNT_CODE', document: CHECK_DISCOUNT_CODE }
];

const allFragments: Array<{ name: string; document: DocumentNode }> = [
  { name: 'HOUSE_SEARCH_RESULT_FIELDS', document: HOUSE_SEARCH_RESULT_FIELDS },
  { name: 'BOOKING_FORM_LABEL_FIELDS', document: BOOKING_FORM_LABEL_FIELDS },
  {
    name: 'BOOKING_FORM_CONFIGURATION_FIELDS',
    document: BOOKING_FORM_CONFIGURATION_FIELDS
  }
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
