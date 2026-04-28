import { t } from '../../intl';

function createNote(): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'bu_reviews__note';

  const link = document.createElement('a');
  link.href = 'https://www.bukazu.com';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = t('reviews_note_link');

  wrapper.appendChild(link);
  return wrapper;
}

export default createNote;
