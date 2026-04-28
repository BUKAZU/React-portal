import createNote from '../note';

jest.mock('../../../intl', () => ({
  t: (id: string) => id
}));

describe('Note', () => {
  it('creates the bukazu link with expected attributes and text', () => {
    const note = createNote();

    const link = note.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://www.bukazu.com');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.textContent).toBe('reviews_note_link');
  });
});
