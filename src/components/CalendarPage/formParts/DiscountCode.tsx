import React, { ReactNode } from 'react';
import { Field } from 'formik';
import { t } from '../../../intl';
import { useMutation } from '../../../_lib/hooks';
import { HouseType } from '../../../types';
import { CHECK_DISCOUNT_CODE } from '../../../_lib/gql';

function DiscountCode({ house }: { house: HouseType }): ReactNode {
  const [checkCode, { loading, error, data }] =
    useMutation(CHECK_DISCOUNT_CODE);

  return (
    <div className="form-row inline">
      <label htmlFor="discount_code">{t('discount_code')}</label>
      <Field name="discount_code">
        {({ field, form }) => {
          return (
            <input
              {...field}
              onChange={(e) => {
                checkCode({
                  variables: { code: e.target.value, house_code: house.code }
                });
                form.setFieldValue(field.name, e.target.value);
              }}
            ></input>
          );
        }}
      </Field>
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
