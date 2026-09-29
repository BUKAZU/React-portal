import { searchFilters, searchInfo } from '../search_tracking';

describe('searchInfo', () => {
  it('splits dates and persons from the remaining filters', () => {
    expect(
      searchInfo(
        {
          arrival_date: '2026-07-01',
          departure_date: '2026-07-08',
          persons_min: '4',
          bedrooms_min: '2',
          countries: '12',
          properties: [3, 5],
          extra_search: 'near the beach'
        },
        17
      )
    ).toEqual({
      arrival: '2026-07-01',
      departure: '2026-07-08',
      persons: 4,
      filters: { bedrooms_min: '2', countries: '12', properties: [3, 5] },
      result_count: 17
    });
  });

  it('leaves out what is not set', () => {
    expect(searchInfo({ persons_min: '', arrival_date: 'soon' }, 0)).toEqual({
      arrival: undefined,
      departure: undefined,
      persons: undefined,
      filters: undefined,
      result_count: 0
    });
  });
});

describe('searchFilters', () => {
  it('keeps tokens, numbers and booleans and drops everything else', () => {
    expect(
      searchFilters({
        cities: 'Den Haag',
        regions: '',
        category_4: 7,
        pets: true,
        nested: { a: 1 },
        empty: [],
        mixed: ['1', 'two words', 3],
        'bad key': '1'
      } as never)
    ).toEqual({ category_4: 7, pets: true, mixed: ['1', 3] });
  });
});
