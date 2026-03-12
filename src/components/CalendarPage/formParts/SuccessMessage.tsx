import React from 'react';
import { t } from '../../../intl';

const SuccessMessage = () => (
  <div className="success-message">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      x="0px"
      y="0px"
      viewBox="0 0 100 125"
      style={{
        enableBackground: 'new 0 0 100 100;',
        fill: 'green',
        height: '150px',
      }}
      xmlSpace="preserve"
    >
      <path d="M50,5C25.2,5,5,25.1,5,50c0,24.8,20.2,45,45,45s45-20.2,45-45C95,25.1,74.8,5,50,5z M72.7,38.2L44.2,66.7  c-0.4,0.4-0.9,0.6-1.4,0.6s-1-0.2-1.4-0.6l-14-14c-0.8-0.8-0.8-2,0-2.8c0.8-0.8,2-0.8,2.8,0l12.6,12.6l27.1-27.1  c0.8-0.8,2-0.8,2.8,0C73.5,36.1,73.5,37.4,72.7,38.2z" />
    </svg>
    <h3>
      {t('thank_you_for_your_request')}
    </h3>
    <p>
      {t('we_sent_confirmation_check_email')}
    </p>
  </div>
);

export default SuccessMessage;
