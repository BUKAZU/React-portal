import React, { useContext } from 'react';
import { t } from '../../../intl';
import { AppContext } from '../../AppContext';

const CancelInsuranceText = () => {
  const { locale } = useContext(AppContext);

  const links = {
    nl: 'https://recreatieverzekeringen.nl/veelgestelde-vragen',
    de: 'https://recreatieverzekeringen.nl/de/haufig-gestellte-fragen',
    en: 'https://recreatieverzekeringen.nl/en/frequently-asked-questions',
    fr: 'https://recreatieverzekeringen.nl/en/frequently-asked-questions',
    es: 'https://recreatieverzekeringen.nl/en/frequently-asked-questions',
    it: 'https://recreatieverzekeringen.nl/en/frequently-asked-questions'
  };

  return (
    <>
      <h2>
        {t('cancel_insurance_normal_long')}
      </h2>
      <p>
        {t('cancel_insurance_normal_desc')}
      </p>
      <h3>
        {t('cancel_insurance_more_insured')}
      </h3>
      <p>
        {t('cancel_insurance_more_insured_desc')}
      </p>

      <h3>
        {t('cancel_insurance_important')}
      </h3>
      <p>
        {t('cancel_insurance_important_message')}
      </p>

      <h3>
        {t('cancel_insurance_for_whom')}
      </h3>
      <p>
        {t('cancel_insurance_for_whom_explain')}
      </p>
      <h3>
        {t('cancel_insurance_questions')}
      </h3>
      <p>
        {t('cancel_insurance_questions_explain_1')}
        <a href={links[locale]} target="_blank">
          {t('cancel_insurance_questions_explain_link')}
        </a>
        {t('cancel_insurance_questions_explain_2')}
      </p>
      <h3>
        {t('terms')}
      </h3>
      <a
        href={`https://api.bukazu.com/files/${locale}/insurance.pdf`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('show_terms')}
      </a>
    </>
  );
};

export default CancelInsuranceText;
