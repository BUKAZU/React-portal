import React, { useState } from 'react';
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

/**
 * Folded away behind "Have a discount code?" so most visitors never see the
 * fields; open from the start when a discount is already in the values.
 */
const Discount = ({
  errors,
  house,
  bookingFormConfiguration,
  values
}: Props) => {
  const discountField = useBookingField('discount');
  const discountReasonField = useBookingField('discount_reason');
  const [open, setOpen] = useState(
    Number(values.discount) > 0 || values.discount_code !== ''
  );

  if (
    (house.discounts && house.discounts !== '0') ||
    bookingFormConfiguration.show_discount_code
  ) {
    const discounts = house.discounts ? house.discounts.split(',') : [];

    return (
      <div className="form-section bup-16 bu-discount">
        <div className="bu-section-head">
          <h2>{t('discount')}</h2>
          <button
            type="button"
            className="bu-link-button bu-discount-toggle"
            aria-expanded={open}
            onClick={() => setOpen((isOpen) => !isOpen)}
          >
            {open ? t('hide') : t('have_discount_code')}
          </button>
        </div>
        {open && (
          <div className="bu-discount-fields">
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
                  <label htmlFor="discount_reason">
                    {t('discount_reason')}
                  </label>
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
                {house.discounts_info && (
                  <div className="bu-discount-info">{house.discounts_info}</div>
                )}
              </>
            )}
            {bookingFormConfiguration.show_discount_code && (
              <DiscountCode house={house} />
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Discount;
