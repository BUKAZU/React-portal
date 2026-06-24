import React, { useCallback, useContext, useState } from 'react';
import { useMutation } from '@apollo/client';
import { t } from '../../intl';
import { CREATE_BOOKING_MUTATION } from '../../_lib/gql';
import { getSessionIdentifier } from '../../_lib/Tracking';
import { ApiError } from '../Error';
import Modal from '../Modal';
import { AppContext } from '../AppContext';
import {
  BookingFormContext,
  BookingFormErrors,
  BookingFormTouched
} from './BookingFormContext';
import {
  CalendarContext,
  CalendarContextDispatch
} from './CalendarParts/CalendarContext';
import Summary from './Summary';
import { BookingType } from './calender_types';
import { Insurances } from './formParts/insurances';
import Discount from './formParts/discount';
import DefaultBookingFields from './formParts/DefaultBookingFields';
import SuccessMessage from './formParts/SuccessMessage';
import OptionalBookingFields, {
  isInt
} from './formParts/OptionalBookingFields';
import {
  calculatePersons,
  initializeBookingFields,
  setByString
} from './formParts/BookingHelpers';
import OptionalCosts from './formParts/OptionalCosts';
import Guests from './formParts/Guests';
import { validateForm } from './formParts/Validations';
import { PossibleValues, SingleBookingFieldType } from './formParts/form_types';
import { HouseType, LocaleType, PortalSiteType } from '../../types';

interface Props {
  house: HouseType;
  PortalSite: PortalSiteType;
  booking: BookingType;
}

function createTouchedState(
  bookingFields: SingleBookingFieldType[],
  values: PossibleValues
): BookingFormTouched {
  let touched: BookingFormTouched = {
    adults: true,
    children: true,
    babies: true,
    cancel_insurance: true
  };

  bookingFields.forEach((field) => {
    touched = setByString(
      touched,
      isInt(field.id) ? `extra_fields.booking_field_${field.id}` : field.id,
      true
    );
  });

  if (Number(values.discount) > 0) {
    touched.discount_reason = true;
  }

  if (values.cancel_insurance === '1' || values.cancel_insurance === '2') {
    ['address', 'house_number', 'zipcode', 'city'].forEach((fieldName) => {
      touched = setByString(touched, fieldName, true);
    });
    touched = setByString(touched, 'extra_fields.date_of_birth', true);
  }

  return touched;
}

function FormCreator({ house, PortalSite }: Props): JSX.Element {
  const { persons, arrivalDate, departureDate } = useContext(CalendarContext);
  const { locale, portalCode, objectCode } = useContext(AppContext);
  const dispatch = useContext(CalendarContextDispatch);
  const { options } = PortalSite;
  const bookingFormConfiguration = PortalSite.bookingFormConfiguration;
  const bookingFields = (options.bookingFields ||
    DefaultBookingFields) as SingleBookingFieldType[];
  const bookingPrice = house.booking_price;

  const createInitialValues = useCallback((): PossibleValues => {
    const initialCosts: Record<string, string> = {};

    for (const cost of bookingPrice.optional_house_costs) {
      initialCosts[cost.id] = '0';
    }

    const defaultValues = {
      ...initializeBookingFields(bookingFields),
      arrivalDate,
      departureDate,
      is_option: 'false' as const,
      costs: initialCosts,
      adults: persons,
      children: 0,
      babies: 0,
      persons,
      discount: 0,
      country: 'nl',
      cancel_insurance: '0' as const,
      discount_code: '',
      extra_fields: {}
    };

    return {
      ...defaultValues,
      persons: calculatePersons(house, defaultValues)
    };
  }, [
    arrivalDate,
    bookingFields,
    bookingPrice.optional_house_costs,
    departureDate,
    house,
    persons
  ]);

  const [values, setValues] = useState<PossibleValues>(() =>
    createInitialValues()
  );
  const [touched, setTouched] = useState<BookingFormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createBooking, { loading, error, data, reset }] = useMutation(
    CREATE_BOOKING_MUTATION
  );

  const setFieldValue = useCallback(
    (name: string, value: unknown) => {
      setValues((currentValues) => {
        let nextValues = setByString(currentValues, name, value);

        if (['adults', 'children', 'babies'].includes(name)) {
          nextValues = {
            ...nextValues,
            persons: calculatePersons(house, nextValues)
          };
        }

        return nextValues;
      });
    },
    [house]
  );

  const setFieldTouched = useCallback((name: string, isTouched = true) => {
    setTouched((currentTouched) =>
      setByString(currentTouched, name, isTouched)
    );
  }, []);

  const sessionIdentifier = getSessionIdentifier();

  console.log({ sessionIdentifier });
  const errors: BookingFormErrors = validateForm(values, house, bookingFields);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextErrors = validateForm(values, house, bookingFields);

      setTouched(createTouchedState(bookingFields, values));

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);

      try {
        const variables = {
          ...values,
          is_option: JSON.parse(values.is_option),
          house_code: objectCode,
          portal_code: portalCode,
          comment: values.comment || '',
          language: locale,
          country: values.country.toUpperCase(),
          adults: Number(values.adults),
          children: Number(values.children) || 0,
          babies: Number(values.babies) || 0,
          discount: Number(values.discount) || 0,
          cancel_insurance: Number(values.cancel_insurance) || 0,
          arrival_date: values.arrivalDate.date,
          departure_date: values.departureDate.date,
          costs: JSON.stringify(values.costs),
          extra_fields: JSON.stringify(values.extra_fields),
          sessionIdentifier
        };

        await createBooking({ variables });

        const localeRedirectKeyMap: Record<
          LocaleType,
          | 'redirectUrlNl'
          | 'redirectUrlEn'
          | 'redirectUrlDe'
          | 'redirectUrlFr'
          | 'redirectUrlEs'
          | 'redirectUrlIt'
        > = {
          nl: 'redirectUrlNl',
          en: 'redirectUrlEn',
          de: 'redirectUrlDe',
          fr: 'redirectUrlFr',
          es: 'redirectUrlEs',
          it: 'redirectUrlIt'
        };
        const localeRedirectKey = localeRedirectKeyMap[locale as LocaleType];
        const localeRedirectUrl = localeRedirectKey
          ? bookingFormConfiguration[localeRedirectKey]
          : undefined;

        if (localeRedirectUrl && localeRedirectUrl !== '') {
          window.location = localeRedirectUrl;
        } else if (
          bookingFormConfiguration.redirectUrl &&
          bookingFormConfiguration.redirectUrl !== ''
        ) {
          window.location = bookingFormConfiguration.redirectUrl;
        } else {
          setTimeout(() => {
            dispatch({
              type: 'return'
            });
          }, 15000);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      bookingFields,
      bookingFormConfiguration,
      createBooking,
      dispatch,
      house,
      locale,
      objectCode,
      portalCode,
      sessionIdentifier,
      values
    ]
  );

  return (
    <BookingFormContext.Provider
      value={{
        values,
        errors,
        touched,
        isSubmitting,
        setFieldValue,
        setFieldTouched
      }}
    >
      <form className="form" onSubmit={handleSubmit}>
        {loading && <div className="return-message">Creating booking...</div>}
        {error && (
          <Modal show={true} onClose={reset}>
            <ApiError errors={error} />
          </Modal>
        )}
        {data && (
          <Modal show={true}>
            <SuccessMessage />
          </Modal>
        )}

        <div className="form-content">
          <div className="form-section bup-16">
            <a
              className="return-link"
              role="link"
              tabIndex={0}
              onClick={() => {
                dispatch({
                  type: 'return'
                });
              }}
            >
              {t('return_to_calendar')}
            </a>
            <h2>{t('stay_details')}</h2>
            <Guests
              bookingFormConfiguration={bookingFormConfiguration}
              house={house}
            />

            {errors.max_persons && (
              <div className="error-message bu-error-message persons">
                {errors.max_persons}
              </div>
            )}
          </div>
          <Discount
            errors={errors}
            house={house}
            bookingFormConfiguration={bookingFormConfiguration}
            values={values}
          />

          <Insurances house={house} values={values} />

          <OptionalCosts costs={bookingPrice.optional_house_costs} />

          <OptionalBookingFields
            bookingFields={bookingFields}
            errors={errors}
            touched={touched}
            PortalSite={PortalSite}
            values={values}
          />
        </div>

        <div className="form-sum bup-16">
          <Summary house={house} values={values} />
          <div className="terms">
            {PortalSite.form_submit_text}{' '}
            <Modal buttonText={t('terms')}>
              <div
                style={{
                  width: '90vh',
                  height: '90vh'
                }}
              >
                <iframe
                  src={house.rental_terms}
                  width="100%"
                  height="100%"
                  title="Terms"
                />
              </div>
            </Modal>
            {house.allow_option && (
              <span>
                {', '}
                {t('option_is_free')}
              </span>
            )}
          </div>
          {[1, 2].includes(Number(values.cancel_insurance)) ? (
            <div className="terms">{t('comply_insurance_card')}</div>
          ) : null}
          <button
            className="bu-calendar-button"
            type="submit"
            disabled={isSubmitting}
          >
            {PortalSite.form_submit_button_text}
          </button>
        </div>
      </form>
    </BookingFormContext.Provider>
  );
}

export default FormCreator;
