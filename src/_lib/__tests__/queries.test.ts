import {
  validate,
  buildClientSchema,
  GraphQLSchema,
  DocumentNode,
} from 'graphql';
import {
  PORTAL_QUERY,
  CALENDAR_QUERY,
  BOOKING_PRICE_QUERY,
  CREATE_BOOKING_MUTATION,
  SINGLE_HOUSE_QUERY,
} from '../queries';
import {
  HOUSES_QUERY,
  HOUSES_PRICE_QUERY,
  HOUSE_COUNT_QUERY,
} from '../SearchQueries';
import { BOOKING_PRICE_TOTAL_QUERY } from '../../components/CalendarPage/Summary/Queries';
import { BOOKING_PRICE_QUERY as PRICE_FIELD_BOOKING_PRICE_QUERY } from '../../components/CalendarPage/PriceField/Queries';
import { REVIEWS_QUERY } from '../../components/ReviewsPage/Queries';
import { CHECK_DISCOUNT_CODE } from '../../components/CalendarPage/formParts/DiscountCode';
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
  { name: 'PRICE_FIELD_BOOKING_PRICE_QUERY', document: PRICE_FIELD_BOOKING_PRICE_QUERY },
  { name: 'REVIEWS_QUERY', document: REVIEWS_QUERY },
  { name: 'CHECK_DISCOUNT_CODE', document: CHECK_DISCOUNT_CODE },
];

describe('GraphQL queries comply with API schema', () => {
  let schema: GraphQLSchema;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema = buildClientSchema(introspectionResult as any);
  });

  describe('query documents are syntactically valid', () => {
    it.each(allQueries)('$name is a valid GraphQL document', ({ document }: { name: string; document: DocumentNode }) => {
      expect(document).toBeDefined();
      expect(document.kind).toBe('Document');
      expect(document.definitions.length).toBeGreaterThan(0);
    });
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
