import { getScoreColor, getScoreLabelKey } from '../getScoreColor';

describe('getScoreColor', () => {
  it('returns "best" for ratings above 7', () => {
    expect(getScoreColor(8.1)).toBe('best');
    expect(getScoreColor(9)).toBe('best');
    expect(getScoreColor(10)).toBe('best');
  });

  it('returns "good" for ratings above 6 up to 7', () => {
    expect(getScoreColor(7.1)).toBe('good');
    expect(getScoreColor(8)).toBe('good');
  });

  it('returns "medium" for ratings above 4 up to 6', () => {
    expect(getScoreColor(5.6)).toBe('medium');
    expect(getScoreColor(6.5)).toBe('medium');
    expect(getScoreColor(7)).toBe('medium');
  });

  it('returns "low" for ratings 4 and below', () => {
    expect(getScoreColor(5.5)).toBe('low');
    expect(getScoreColor(4)).toBe('low');
    expect(getScoreColor(0)).toBe('low');
  });

  it('handles boundary values exactly', () => {
    expect(getScoreColor(8)).toBe('good');
    expect(getScoreColor(7)).toBe('medium');
    expect(getScoreColor(5.5)).toBe('low');
  });

  it('maps every band to its label key', () => {
    expect(getScoreLabelKey(9)).toBe('score_excellent');
    expect(getScoreLabelKey(7.5)).toBe('score_very_good');
    expect(getScoreLabelKey(6)).toBe('score_good');
    expect(getScoreLabelKey(3)).toBe('score_fair');
  });
});
