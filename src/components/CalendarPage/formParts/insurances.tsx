import React from 'react';
import { t } from '../../../intl';
import Modal from '../../Modal';
import Icon from '../../icons/info.svg';
import { DateField } from '../FormItems';
import { useBookingField } from '../BookingFormContext';
import CancelInsuranceText from './CancelInsuranceText';
import { translatedOption } from './BookingHelpers';
import { PossibleValues } from './form_types';
import { HouseType } from '../../../types';

type Props = {
  house: HouseType;
  values: PossibleValues;
};

function CancelInsurance({ house }: { house: HouseType }) {
  const field = useBookingField('cancel_insurance');

  if (!house.cancel_insurance) {
    return null;
  }

  return (
    <div className="form-row inline">
      <label htmlFor="cancel_insurance">{t('cancel_insurance')}</label>
      <select
        id="cancel_insurance"
        name="cancel_insurance"
        value={String(field.value)}
        onChange={field.onChange}
        onBlur={field.onBlur}
        required={true}
      >
        {translatedOption('choose', '')}
        {translatedOption('cancel_insurance_normal', '1')}
        {translatedOption('none', '0')}
      </select>
      <Modal buttonText={<Icon />}>
        <CancelInsuranceText />
      </Modal>
    </div>
  );
}

export const Insurances = ({ house, values }: Props) => {
  if (house.cancel_insurance) {
    return (
      <div className="form-section bup-16" id="insurances">
        <h2>{t('insurances')}</h2>
        <CancelInsurance house={house} />
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
