import React from 'react';
import { t } from '../../../intl';
import Modal from '../../Modal';
import Icon from '../../icons/info.svg';
import { DateField } from '../FormItems';
import { useBookingField, useBookingFormContext } from '../BookingFormContext';
import CancelInsuranceText from './CancelInsuranceText';
import { PossibleValues } from './form_types';
import { HouseType } from '../../../types';

type Props = {
  house: HouseType;
  values: PossibleValues;
};

/** None / Standard as two chips; the value still travels as cancel_insurance. */
function CancelInsurance() {
  const field = useBookingField('cancel_insurance');
  const { setFieldValue } = useBookingFormContext();

  const value = String(field.value);
  const option = (optionValue: string, label: string) => (
    <button
      type="button"
      className="bu-chip"
      aria-pressed={value === optionValue}
      onClick={() => setFieldValue('cancel_insurance', optionValue)}
    >
      {t(label)}
    </button>
  );

  return (
    <div className="form-row bu-insurance">
      <div className="bu-field-label" id="cancel_insurance_label">
        {t('cancel_insurance')}
        <Modal buttonText={<Icon />}>
          <CancelInsuranceText />
        </Modal>
      </div>
      <div
        className="bu-chips"
        role="group"
        aria-labelledby="cancel_insurance_label"
      >
        {option('0', 'none')}
        {option('1', 'cancel_insurance_normal')}
      </div>
      <input type="hidden" name="cancel_insurance" value={value} />
    </div>
  );
}

export const Insurances = ({ house, values }: Props) => {
  if (house.cancel_insurance) {
    return (
      <div className="form-section bup-16" id="insurances">
        <h2>{t('insurances')}</h2>
        <CancelInsurance />
        {values.cancel_insurance && values.cancel_insurance !== '0' && (
          <DateField
            label="extra_fields.date_of_birth"
            name="extra_fields.date_of_birth"
            required
            inline={false}
            description={t('insurance_company_needs_date_of_birth')}
          />
        )}
      </div>
    );
  }

  return <div />;
};
