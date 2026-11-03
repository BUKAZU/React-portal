import { isViewMode, readStoredViewMode, storeViewMode } from '../view_mode';

afterEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe('isViewMode', () => {
  test.each(['grid', 'list'])('%s is a view mode', (value) => {
    expect(isViewMode(value)).toBe(true);
  });

  test.each(['table', '', null, undefined, 2])('%p is not', (value) => {
    expect(isViewMode(value)).toBe(false);
  });
});

describe('readStoredViewMode', () => {
  test('returns null when nothing was stored', () => {
    expect(readStoredViewMode()).toBeNull();
  });

  test('returns the stored mode', () => {
    window.localStorage.setItem('bukazuViewMode', 'list');

    expect(readStoredViewMode()).toBe('list');
  });

  test('ignores unknown stored values', () => {
    window.localStorage.setItem('bukazuViewMode', 'carousel');

    expect(readStoredViewMode()).toBeNull();
  });

  test('treats a throwing storage as nothing stored', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readStoredViewMode()).toBeNull();
  });
});

describe('storeViewMode', () => {
  test('remembers the mode', () => {
    storeViewMode('grid');

    expect(window.localStorage.getItem('bukazuViewMode')).toBe('grid');
  });

  test('ignores storage failures', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => storeViewMode('list')).not.toThrow();
  });
});
