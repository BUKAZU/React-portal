import { createElement, type ReactElement } from 'react';
import { t } from '../../intl';

function Note(): ReactElement {
  return createElement(
    'div',
    { className: 'bu_reviews__note' },
    createElement(
      'a',
      {
        href: 'https://www.bukazu.com',
        target: '_blank',
        rel: 'noopener noreferrer'
      },
      t('reviews_note_link')
    )
  );
}

export default Note;