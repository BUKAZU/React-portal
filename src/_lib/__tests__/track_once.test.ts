import {
  firstHouseView,
  firstPriceUnavailable,
  firstQuote,
  resetTrackOnce
} from '../track_once';

const stay = { arrival: '2026-07-01', departure: '2026-07-08' };

beforeEach(() => {
  resetTrackOnce();
});

describe('firstHouseView', () => {
  it('is true once per house', () => {
    expect(firstHouseView('HOUSE1')).toBe(true);
    expect(firstHouseView('HOUSE2')).toBe(true);
    expect(firstHouseView('HOUSE1')).toBe(false);
  });
});

describe('firstPriceUnavailable', () => {
  it('is true once per house and stay', () => {
    expect(firstPriceUnavailable('HOUSE1', stay)).toBe(true);
    expect(firstPriceUnavailable('HOUSE1', { ...stay })).toBe(false);
    expect(
      firstPriceUnavailable('HOUSE1', { ...stay, departure: '2026-07-15' })
    ).toBe(true);
    expect(firstPriceUnavailable('HOUSE2', stay)).toBe(true);
  });
});

describe('firstQuote', () => {
  it('is true once per house, stay and persons', () => {
    expect(firstQuote('HOUSE1', stay, 2)).toBe(true);
    expect(firstQuote('HOUSE1', stay, 2)).toBe(false);
    expect(firstQuote('HOUSE1', stay, 4)).toBe(true);
    expect(firstQuote('HOUSE2', stay, 2)).toBe(true);
  });
});

it('keeps each kind of event apart', () => {
  expect(firstPriceUnavailable('HOUSE1', stay)).toBe(true);
  expect(firstQuote('HOUSE1', stay, 2)).toBe(true);
  expect(firstHouseView('HOUSE1')).toBe(true);
});

describe('resetTrackOnce', () => {
  it('forgets everything tracked so far', () => {
    firstHouseView('HOUSE1');
    firstPriceUnavailable('HOUSE1', stay);
    firstQuote('HOUSE1', stay, 2);

    resetTrackOnce();

    expect(firstHouseView('HOUSE1')).toBe(true);
    expect(firstPriceUnavailable('HOUSE1', stay)).toBe(true);
    expect(firstQuote('HOUSE1', stay, 2)).toBe(true);
  });
});
