import { getScoreColor } from '../getScoreColor';

describe('getScoreColor', () => {
  it('returns "best" for ratings above 7', () => {
    expect(getScoreColor(7.1)).toBe('best');
    expect(getScoreColor(8)).toBe('best');
    expect(getScoreColor(10)).toBe('best');
  });

  it('returns "good" for ratings above 6 up to 7', () => {
    expect(getScoreColor(6.1)).toBe('good');
    expect(getScoreColor(7)).toBe('good');
  });

  it('returns "medium" for ratings above 4 up to 6', () => {
    expect(getScoreColor(4.1)).toBe('medium');
    expect(getScoreColor(5)).toBe('medium');
    expect(getScoreColor(6)).toBe('medium');
  });

  it('returns "low" for ratings 4 and below', () => {
    expect(getScoreColor(4)).toBe('low');
    expect(getScoreColor(2)).toBe('low');
    expect(getScoreColor(0)).toBe('low');
  });

  it('handles boundary values exactly', () => {
    expect(getScoreColor(7)).toBe('good');
    expect(getScoreColor(6)).toBe('medium');
    expect(getScoreColor(4)).toBe('low');
  });
});
