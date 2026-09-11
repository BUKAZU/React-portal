import React from 'react';
import { t } from '../../../intl';
import Check from '../../icons/Check.svg';

const SuccessMessage = () => (
  <div className="success-message bu-success">
    <div className="bu-success-icon">
      <Check size={28} />
    </div>
    <h3>{t('thank_you_for_your_request')}</h3>
    <p>{t('we_sent_confirmation_check_email')}</p>
    <p className="bu-success-hint">{t('returning_to_calendar')}</p>
  </div>
);

export default SuccessMessage;
