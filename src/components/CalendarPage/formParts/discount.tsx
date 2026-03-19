import React from 'react';
import { Field } from 'formik';
import { t } from '../../../intl';
import { HouseType } from '../../../types';
import { PossibleValues } from './form_types';

interface Props {
  errors: Record<string, string | undefined>;
  house: HouseType;
  values: PossibleValues;
}

const Discount = ({ errors, house, values }: Props) => {
  if (house.discounts && house.discounts !== '0') {
    let discounts = house.discounts.split(',');
    return (
      <div className="form-section bup-16">
        <div className="form-row inline">
          <label htmlFor="discount">
            {t('discount')}
          </label>
          <Field component="select" name="discount">
            {discounts.map((discount) => (
              <option value={discount} key={discount}>
                {discount}%
              </option>
            ))}
          </Field>
        </div>
        <div className="form-row inline">
          <label htmlFor="discount_reason">
            {t('discount_reason')}
          </label>
          <Field name="discount_reason" />
          {errors.discount_reason && (
            <div className="error-message bu-error-message">
              {errors.discount_reason}
            </div>
          )}
        </div>
        <div>
          <i style={{ fontSize: 14 }}>{house.discounts_info}</i>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default Discount;
