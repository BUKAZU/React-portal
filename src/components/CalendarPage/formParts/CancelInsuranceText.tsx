import React, { useContext } from 'react';
import { FormattedMessage as FM } from 'react-intl';
import { AppContext } from '../../AppContext';

const CancelInsuranceText = () => {
  const { locale } = useContext(AppContext);

  return (
    <>
      <h2>
        <FM id="cancel_insurance" />
      </h2>
      <hr />
      <p>
        <FM id="cancel_insurance_desc" />
      </p>
      <h3>
        <FM id="cancel_insurance_normal_long" />
      </h3>
      <p>
        <FM id="cancel_insurance_normal_desc" />
      </p>
      <h3>
        <FM id="cancel_insurance_all_risk_long" />
      </h3>
      <p>
        <FM id="cancel_insurance_all_risk_desc" />
      </p>

      <h3>
        <FM id="terms_and_costs" />
      </h3>
      <h4>
        <FM id="costs_normal_cancel_insurance" />
      </h4>
      <p>
        <FM id="666_costs" />
      </p>
      <h4>
        <FM id="costs_allrisk_cancel_insurance" />
      </h4>
      <p>
        <FM id="847_costs" />
      </p>
      <p>
        <FM id="more_information" />
      </p>
      <a
        href={`https://api.bukazu.com/files/${locale}/insurance.pdf`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FM id="show_terms" />
      </a>
      <h3>
        <FM id="terms" />
      </h3>
      <ul>
        <li>
          <FM id="9persons_9addresses" />
        </li>
        <li>
          <strong>
            <FM id="or" />
          </strong>
        </li>
        <li>
          <FM id="9persons_4addresses" />
        </li>
      </ul>

      <hr />
      <h2>
        <FM id="poliscosts" />
      </h2>
      <p>
        <FM id="poliscosts_are" />
      </p>

      <p>
        <FM id="youwillrecieve" />
      </p>
    </>
  );
};

export default CancelInsuranceText;
