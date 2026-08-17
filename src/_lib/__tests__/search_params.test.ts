import { buildSearchParams } from '../search_params';
import type { FiltersType } from '../../components/SearchPage/filters/filter_types';

const pagination = { limit: 12, skip: 24 };

describe('buildSearchParams', () => {
  it('always sends the pagination', () => {
    expect(buildSearchParams({}, pagination)).toEqual({
      limit: '12',
      skip: '24'
    });
  });

  it('maps the location filters onto their API names', () => {
    const params = buildSearchParams(
      { countries: '1', regions: '1|Zeeland', cities: '1|Zeeland|Domburg' },
      pagination
    );

    expect(params).toMatchObject({
      country_id: '1',
      region_id: '1|Zeeland',
      city_id: '1|Zeeland|Domburg'
    });
  });

  it('sends extra_search, which the GraphQL query silently dropped', () => {
    expect(
      buildSearchParams({ extra_search: 'beachfront' }, pagination)
    ).toMatchObject({
      extra_search: 'beachfront'
    });
  });

  it('sends the numeric filters that have a value', () => {
    const params = buildSearchParams(
      {
        persons_min: '4',
        persons_max: '8',
        bedrooms_min: '2',
        bathrooms_min: '1',
        weekprice_max: '900'
      },
      pagination
    );

    expect(params).toMatchObject({
      persons_min: '4',
      persons_max: '8',
      bedrooms_min: '2',
      bathrooms_min: '1',
      weekprice_max: '900'
    });
  });

  it('omits numeric filters that are empty, zero or not a number', () => {
    const params = buildSearchParams(
      { persons_min: '', persons_max: '0', bedrooms_min: 'all' },
      pagination
    );

    expect(params).not.toHaveProperty('persons_min');
    expect(params).not.toHaveProperty('persons_max');
    expect(params).not.toHaveProperty('bedrooms_min');
  });

  it('merges the properties filter and the per-category filters into one list', () => {
    const filters = {
      properties: [3, 7],
      category_1: '11',
      category_2: '',
      persons_min: '2'
    } as FiltersType;

    expect(buildSearchParams(filters, pagination).properties).toBe('3,7,11');
  });

  it('omits properties when nothing is selected', () => {
    expect(
      buildSearchParams({ properties: [] }, pagination)
    ).not.toHaveProperty('properties');
  });

  it('asks for availability on the arrival date alone', () => {
    const params = buildSearchParams(
      { arrival_date: '2026-06-01' },
      pagination
    );

    expect(params).toMatchObject({
      arrival_date: '2026-06-01',
      no_nights_min: '1'
    });
    expect(params).not.toHaveProperty('starts_at');
    expect(params).not.toHaveProperty('ends_at');
  });

  it('asks for prices and the number of nights when both dates are set', () => {
    const params = buildSearchParams(
      { arrival_date: '2026-06-01', departure_date: '2026-06-08' },
      pagination
    );

    expect(params).toMatchObject({
      arrival_date: '2026-06-01',
      starts_at: '2026-06-01',
      ends_at: '2026-06-08',
      no_nights_min: '7'
    });
  });

  it('ignores a departure date without an arrival date', () => {
    const params = buildSearchParams(
      { departure_date: '2026-06-08' },
      pagination
    );

    expect(params).toEqual({ limit: '12', skip: '24' });
  });
});
