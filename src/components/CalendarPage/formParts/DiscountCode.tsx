import React, { useContext, useRef, useState } from 'react';
import { t, formatNumber } from '../../../intl';
import { AppContext } from '../../AppContext';
import {
  DiscountCodeError,
  DiscountCodeResponse,
  fetchDiscountCode
} from '../../../_lib/discount_code';
import { HouseType } from '../../../types';
import { useBookingField } from '../BookingFormContext';

function DiscountCode({ house }: { house: HouseType }): JSX.Element {
  const { apiUrl, locale, portalCode } = useContext(AppContext);
  const field = useBookingField('discount_code');
  const [result, setResult] = useState<DiscountCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [failed, setFailed] = useState(false);
  // Only the response of the most recent lookup may update the state; a slower
  // earlier request must never overwrite it.
  const requestId = useRef(0);

  const checkCode = (code: string) => {
    const currentRequest = ++requestId.current;

    if (code === '') {
      setResult(null);
      setNotFound(false);
      setFailed(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetchDiscountCode({
      apiUrl,
      locale,
      portalCode,
      objectCode: house.code,
      code
    })
      .then((discountCode) => {
        if (currentRequest !== requestId.current) return;
        setResult(discountCode);
        setNotFound(false);
        setFailed(false);
        setLoading(false);
      })
      .catch((error) => {
        if (currentRequest !== requestId.current) return;
        // A 404 is the API's way of saying the code is unknown; anything else
        // is a real failure and gets the generic message.
        const isNotFound = error instanceof DiscountCodeError && error.notFound;
        setResult(null);
        setNotFound(isNotFound);
        setFailed(!isNotFound);
        setLoading(false);
      });
  };

  return (
    <div className="form-row inline">
      <label htmlFor="discount_code">{t('discount_code')}</label>
      <input
        id="discount_code"
        name="discount_code"
        value={String(field.value)}
        onBlur={(event) => {
          field.onBlur();
          checkCode(event.target.value.trim());
        }}
        onChange={field.onChange}
      />
      {loading && <div className="bu_discount_code">Loading...</div>}
      {!loading && notFound && (
        <div className="bu_discount_code">{t('no_discount_code_found')}</div>
      )}
      {!loading && failed && (
        <div className="bu_discount_code">
          {t('something_went_wrong_please_try_again')}
        </div>
      )}
      {!loading && result && (
        <div className="bu_discount_code">
          <div>{result.name}</div>
          {result.use_price ? (
            result.price != null && (
              <div>
                {formatNumber(result.price, {
                  style: 'currency',
                  currency: result.currency
                })}
              </div>
            )
          ) : (
            result.percentage != null && <div>{result.percentage}%</div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiscountCode;
