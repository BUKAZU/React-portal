import React, { ReactNode } from 'react';
import { Field } from 'formik';
import { FormattedMessage } from 'react-intl';
import { gql, useMutation } from '@apollo/client';
import { HouseType } from '../../../types';

function DiscountCode({ house }: { house: HouseType }): ReactNode {
  const [checkCode, { loading, error, data }] =
    useMutation(CHECK_DISCOUNT_CODE);

  return (
    <div className="mb-4">
      <label htmlFor="discount_code">
        <FormattedMessage id="discount_code" />
      </label>
      <Field name="discount_code">
        {({ field, form }) => {
          return (
            <input
              {...field}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
      {loading && <div className="mt-2 text-sm text-gray-500 ">Loading...</div>}
      {error && (
        <div className="mt-2 text-sm text-gray-500">
          <FormattedMessage id="no_discount_code_found" />
        </div>
      )}
      {data && (
        <div className="mt-2 text-sm text-gray-50">
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

const CHECK_DISCOUNT_CODE = gql`
  mutation CheckDiscountCode($code: String!, $house_code: String!) {
    checkDiscountCode(code: $code, house_code: $house_code) {
      name
      use_price
      percentage
      price
    }
  }
`;

export default DiscountCode;
