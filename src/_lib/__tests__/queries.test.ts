import {
  validate,
  buildClientSchema,
  GraphQLSchema,
  DocumentNode
} from 'graphql';
import { SINGLE_HOUSE_QUERY, CHECK_DISCOUNT_CODE } from '../gql';
import introspectionResult from './schema.json';

const allQueries: Array<{ name: string; document: DocumentNode }> = [
  { name: 'SINGLE_HOUSE_QUERY', document: SINGLE_HOUSE_QUERY },
  { name: 'CHECK_DISCOUNT_CODE', document: CHECK_DISCOUNT_CODE }
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
