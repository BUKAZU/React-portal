import React from 'react';
import { t } from '../../../intl';
import { BookingFormConfigurationType, HouseType } from '../../../types';
import { useBookingField } from '../BookingFormContext';
import DiscountCode from './DiscountCode';
import { PossibleValues } from './form_types';

interface Props {
  errors: Record<string, string | undefined>;
  house: HouseType;
  bookingFormConfiguration: BookingFormConfigurationType;
  values: PossibleValues;
}

const Discount = ({
  errors,
  house,
  bookingFormConfiguration,
  values
}: Props) => {
  const discountField = useBookingField('discount');
  const discountReasonField = useBookingField('discount_reason');

  if (
    (house.discounts && house.discounts !== '0') ||
    bookingFormConfiguration.show_discount_code
  ) {
    const discounts = house.discounts ? house.discounts.split(',') : [];

    return (
      <div className="form-section bup-16">
        {house.discounts && house.discounts !== '0' && (
          <>
            <div className="form-row inline">
              <label htmlFor="discount">{t('discount')}</label>
              <select
                id="discount"
                name="discount"
                value={String(discountField.value)}
                onChange={discountField.onChange}
                onBlur={discountField.onBlur}
              >
                {discounts.map((discount) => (
                  <option value={discount} key={discount}>
                    {discount}%
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row inline">
              <label htmlFor="discount_reason">{t('discount_reason')}</label>
              <input
                id="discount_reason"
                name="discount_reason"
                value={String(discountReasonField.value)}
                onChange={discountReasonField.onChange}
                onBlur={discountReasonField.onBlur}
              />
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
        {bookingFormConfiguration.show_discount_code && (
          <DiscountCode house={house} />
        )}
      </div>
    );
  }

  return null;
};

export default Discount;
