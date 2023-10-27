import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'formik';
import DiscountCode from './DiscountCode';
import { HouseType, PortalOptions } from '../../../types';
import { PossibleValues } from './form_types';

interface Props {
  errors: object;
  house: HouseType;
  options: PortalOptions;
  values: PossibleValues;
}

const Discount = ({ errors, house, options, values }: Props) => {
  if (
    (house.discounts && house.discounts !== '0') ||
    options.bookingForm?.showDiscountCode
  ) {
    let discounts = house.discounts ? house.discounts.split(',') : [];
    return (
      <div className="form-section">
        {house.discounts && house.discounts !== '0' && (
          <>
            <div className="form-row inline">
              <label htmlFor="discount">
                <FormattedMessage id="discount" />
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
                <FormattedMessage id="discount_reason" />
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
          </>
        )}
        {options.bookingForm?.showDiscountCode && (
          <DiscountCode errors={errors} house={house} values={values} />
        )}
      </div>
    );
  } else {
    return null;
  }
};

Discount.propTypes = {
  house: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

export default Discount;
