import React from 'react';
import { Field } from 'formik';
import { t, formatNumber } from '../../../intl';
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
        {t('extra_costs_bookable')}
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
                    <option value={0}>{t('no')}</option>
                    <option value={1}>{t('yes')}</option>
                  </Field>

                  <div className="price_per">
                    €{' '}
                    {formatNumber(cost.amount, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}{' '}
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
                  {formatNumber(cost.amount, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}{' '}
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
