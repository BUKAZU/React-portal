import React, { useContext } from 'react';
import { FormattedMessage as FM } from 'react-intl';
import { AppContext } from '../../AppContext';

const CancelInsuranceText = () => {
  const { locale } = useContext(AppContext);

  return (
    <>
      <h2>
        <FM id="cancel_insurance_normal_long" />
      </h2>
      <p>
        <FM id="cancel_insurance_normal_desc" />
      </p>
      <h3>
        <FM id="cancel_insurance_more_insured" />
      </h3>
      <p>
        <FM id="cancel_insurance_more_insured_desc" />
      </p>

      <h3>
        <FM id="cancel_insurance_important" />
      </h3>
      <p>
        <FM id="cancel_insurance_important_message" />
      </p>

      <h3>
        <FM id="cancel_insurance_for_whom" />
      </h3>
      <p>
        <FM id="cancel_insurance_for_whom_explain" />
      </p>
      <h3>
        <FM id="cancel_insurance_questions" />
      </h3>
      <p>
        <FM id="cancel_insurance_questions_explain" />
      </p>
      <h3>
        <FM id="terms" />
      </h3>
      <a
        href={`https://api.bukazu.com/files/${locale}/insurance.pdf`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FM id="show_terms" />
      </a>
    </>
  );
};

export default CancelInsuranceText;
