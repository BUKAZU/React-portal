import { parseFiltersFromUrl } from '../url_filters';

describe('parseFiltersFromUrl', () => {
  it('parses whitelisted filter keys', () => {
    const filters = parseFiltersFromUrl(
      '?arrival_date=2026-07-01&departure_date=2026-07-08&persons_min=4&countries=12'
    );

    expect(filters).toEqual({
      arrival_date: '2026-07-01',
      departure_date: '2026-07-08',
      persons_min: '4',
      countries: '12'
    });
  });

  it('keeps every value a string', () => {
    const filters = parseFiltersFromUrl('?persons_min=4&weekprice_max=1500');

    expect(filters.persons_min).toBe('4');
    expect(filters.weekprice_max).toBe('1500');
  });

  it('ignores keys that are not filters', () => {
    const filters = parseFiltersFromUrl(
      '?utm_source=newsletter&gclid=abc&arrival_date=2026-07-01'
    );

    expect(filters).toEqual({ arrival_date: '2026-07-01' });
  });

  it('ignores keys with empty values', () => {
    const filters = parseFiltersFromUrl('?arrival_date=&persons_min=2');

    expect(filters).toEqual({ persons_min: '2' });
  });

  it('accepts dynamic category_<id> keys', () => {
    const filters = parseFiltersFromUrl('?category_13=101&category_x=9');

    expect(filters).toEqual({ category_13: '101' });
  });

  it('parses properties as a comma-separated list of ids', () => {
    const filters = parseFiltersFromUrl('?properties=12, 34,,56');

    expect(filters.properties).toEqual(['12', '34', '56']);
  });

  it('omits properties when the list holds no ids', () => {
    const filters = parseFiltersFromUrl('?properties=,%20,');

    expect(filters).toEqual({});
  });

  it('returns an empty object for an empty query string', () => {
    expect(parseFiltersFromUrl('')).toEqual({});
    expect(parseFiltersFromUrl('?')).toEqual({});
  });
});
