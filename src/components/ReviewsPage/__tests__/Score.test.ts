import { getScore } from '../Score';

describe('getScore', () => {
  it('returns formatted rating with one decimal for non-whole numbers', () => {
    expect(getScore(7.55).formatted).toBe('7.5');
    expect(getScore(8.3).formatted).toBe('8.3');
  });

  it('returns whole number without .0 for precise scores', () => {
    expect(getScore(8).formatted).toBe('8');
    expect(getScore(3).formatted).toBe('3');
    expect(getScore(10).formatted).toBe('10');
  });

  it('returns "best" color for ratings above 7', () => {
    expect(getScore(7.1).color).toBe('best');
    expect(getScore(10).color).toBe('best');
  });

  it('returns "good" color for ratings above 6 up to 7', () => {
    expect(getScore(6.5).color).toBe('good');
    expect(getScore(7).color).toBe('good');
  });

  it('returns "medium" color for ratings above 4 up to 6', () => {
    expect(getScore(5).color).toBe('medium');
    expect(getScore(6).color).toBe('medium');
  });

  it('returns "low" color for ratings 4 and below', () => {
    expect(getScore(4).color).toBe('low');
    expect(getScore(1).color).toBe('low');
  });
});
