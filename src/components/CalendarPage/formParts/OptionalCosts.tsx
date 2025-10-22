import React from 'react';
import { Field } from 'formik';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import Modal from '../../Modal';
import Icon from '../../icons/info.svg';
import { createPeronsArray } from './BookingHelpers';

function OptionalCosts({ costs }) {
  if (costs.length === 0) {
    return null;
  }
  return (
    <div className="form-section bup-16 optional_house_costs">
      <h2>
        <FormattedMessage id="extra_costs_bookable" />
      </h2>
      <div>
        {costs.map((cost) => {
          if (
            !['none', 'total'].includes(cost.method) &&
            cost.max_available > 0
          ) {
            if (cost.max_available === 1) {
              return (
                <div className="form-row inline" key={cost.id}>
                  <label htmlFor={cost.id}>{cost.name}</label>
                  <Field component="select" name={`costs[${cost.id}]`}>
                    <FormattedMessage id="no">
                      {(formattedMessage) => (
                        <option value={0}>{formattedMessage}</option>
                      )}
                    </FormattedMessage>
                    <FormattedMessage id="yes">
                      {(formattedMessage) => (
                        <option value={1}>{formattedMessage}</option>
                      )}
                    </FormattedMessage>
                  </Field>

                  <div className="price_per">
                    €{' '}
                    <FormattedNumber
                      value={cost.amount}
                      minimumFractionDigits={2}
                      maximumFractionDigits={2}
                    />{' '}
                    {cost.method_name}
                  </div>
                  <div>
                    {cost.description ? (
                      <div>
                        <Modal buttonText={<Icon />}>
                          <p>{cost.description}</p>
                        </Modal>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            }
            return (
              <div className="form-row inline" key={cost.id}>
                <label htmlFor={cost.id}>{cost.name}</label>
                <Field component="select" name={`costs[${cost.id}]`}>
                  {createPeronsArray(cost.max_available).map((opt) => {
                    return (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    );
                  })}
                </Field>

                <div className="price_per">
                  €{' '}
                  <FormattedNumber
                    value={cost.amount}
                    minimumFractionDigits={2}
                    maximumFractionDigits={2}
                  />{' '}
                  {cost.method_name}
                </div>
                <div>
                  {cost.description ? (
                    <div>
                      <Modal buttonText={<Icon />}>
                        <p>{cost.description}</p>
                      </Modal>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          } else {
            return '';
          }
        })}
      </div>
    </div>
  );
}

export default OptionalCosts;
