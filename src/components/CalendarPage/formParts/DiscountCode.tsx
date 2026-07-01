import React, { ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { t } from '../../../intl';
import { CHECK_DISCOUNT_CODE } from '../../../_lib/gql';
import { HouseType } from '../../../types';
import { useBookingField } from '../BookingFormContext';

function DiscountCode({ house }: { house: HouseType }): ReactNode {
  const [checkCode, { loading, error, data }] =
    useMutation(CHECK_DISCOUNT_CODE);
  const field = useBookingField('discount_code');

  return (
    <div className="form-row inline">
      <label htmlFor="discount_code">{t('discount_code')}</label>
      <input
        id="discount_code"
        name="discount_code"
        value={String(field.value)}
        onBlur={field.onBlur}
        onChange={(event) => {
          checkCode({
            variables: { code: event.target.value, house_code: house.code }
          });
          field.onChange(event);
        }}
      />
      {loading && <div className="bu_discount_code">Loading...</div>}
      {error && (
        <div className="bu_discount_code">{t('no_discount_code_found')}</div>
      )}
      {data && (
        <div className="bu_discount_code">
          <div>{data.checkDiscountCode.name}</div>
          {data.checkDiscountCode.use_price ? (
            <div>€ {data.checkDiscountCode.price}</div>
          ) : (
            <div>{data.checkDiscountCode.percentage}%</div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiscountCode;
