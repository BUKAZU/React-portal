import React from 'react';
import { t, formatNumber } from '../../../intl';
import Modal from '../../Modal';
import Icon from '../../icons/info.svg';
import { useBookingField, useBookingFormContext } from '../BookingFormContext';
import { createPersonsArray } from './BookingHelpers';

type CostType = {
  id: string;
  name: string;
  method: string;
  max_available: number;
  amount: number;
  method_name: string;
  description?: string;
};

/** Yes/no extras as a two-way toggle; countable ones keep a quantity select. */
function CostSelect({ cost }: { cost: CostType }) {
  const name = `costs[${cost.id}]`;
  const field = useBookingField(name);
  const { setFieldValue } = useBookingFormContext();

  if (cost.max_available === 1) {
    const value = String(field.value);
    const option = (optionValue: string, label: string) => (
      <button
        type="button"
        aria-pressed={value === optionValue}
        onClick={() => setFieldValue(name, optionValue)}
      >
        {t(label)}
      </button>
    );
    return (
      <div
        className="bu-segmented"
        role="group"
        aria-labelledby={`bu_cost_${cost.id}`}
      >
        {option('0', 'no')}
        {option('1', 'yes')}
        <input type="hidden" id={cost.id} name={name} value={value} />
      </div>
    );
  }

  return (
    <select
      id={cost.id}
      name={name}
      className="bu-extra-quantity"
      value={String(field.value)}
      onChange={field.onChange}
      onBlur={field.onBlur}
    >
      {createPersonsArray(cost.max_available).map((option) => {
        return (
          <option key={option} value={option}>
            {option}
          </option>
        );
      })}
    </select>
  );
}

function OptionalCosts({
  costs,
  currency
}: {
  costs: CostType[];
  /** ISO 4217 currency code the amounts are expressed in (EUR when unknown). */
  currency?: string;
}) {
  if (costs.length === 0) {
    return null;
  }

  return (
    <div className="form-section bup-16 optional_house_costs">
      <h2>{t('extra_costs_bookable')}</h2>
      <div className="bu-extras">
        {costs.map((cost) => {
          if (
            !['none', 'total'].includes(cost.method) &&
            cost.max_available > 0
          ) {
            return (
              <div className="form-row bu-extra-row" key={cost.id}>
                <div className="bu-extra-info">
                  <label
                    htmlFor={cost.id}
                    id={`bu_cost_${cost.id}`}
                    className="bu-extra-name"
                  >
                    {cost.name}
                    {cost.description ? (
                      <Modal buttonText={<Icon />}>
                        <p>{cost.description}</p>
                      </Modal>
                    ) : null}
                  </label>
                  <div className="price_per bu-extra-price">
                    {formatNumber(cost.amount, {
                      style: 'currency',
                      currency: currency ?? 'EUR'
                    })}{' '}
                    {cost.method_name}
                  </div>
                </div>
                <CostSelect cost={cost} />
              </div>
            );
          }

          return '';
        })}
      </div>
    </div>
  );
}

export default OptionalCosts;
