import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { t } from '../../intl';
import {
  createBooking,
  CreateBookingError,
  CreateBookingResponse
} from '../../_lib/create_booking';
import { buildBookingPayload } from '../../_lib/booking_payload';
import { redirectTo } from '../../_lib/navigation';
import { getSessionIdentifier } from '../../_lib/Tracking';
import { ApiError } from '../Error';
import Modal from '../Modal';
import { AppContext } from '../AppContext';
import { useCurrency } from '../CurrencyContext';
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
import { PricesType } from './Summary/cost_types';
import DateStrip from './DateStrip';
import DatePopover from './DatePopover';
import Close from '../icons/Close.svg';
import { formatNumber } from '../../intl';
import { BookingType } from './calender_types';
import { Insurances } from './formParts/insurances';
import Discount from './formParts/discount';
import SuccessMessage from './formParts/SuccessMessage';
import OptionalBookingFields from './formParts/OptionalBookingFields';
import { isInt } from '../../_lib/utils';
import {
  calculatePersons,
  initializeBookingFields,
  setByString
} from './formParts/BookingHelpers';
import OptionalCosts from './formParts/OptionalCosts';
import Guests from './formParts/Guests';
import { validateForm } from './formParts/Validations';
import { PossibleValues, SingleBookingFieldType } from './formParts/form_types';
import { HouseType } from '../../types';
import type { AppPortalSite } from '../loadPortalSite';

interface Props {
  house: HouseType;
  PortalSite: AppPortalSite;
  booking?: BookingType;
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
  const { locale, portalCode, objectCode, apiUrl } = useContext(AppContext);
  const { currency: selectedCurrency } = useCurrency();
  const dispatch = useContext(CalendarContextDispatch);
  const { options, bookingFormConfiguration } = PortalSite;
  const bookingFields = (options.bookingFields as SingleBookingFieldType[]).map(
    (field) =>
      field.id === 'telephone' ? { ...field, id: 'phonenumber' } : field
  );
  const bookingPrice = house.booking_price!;

  const createInitialValues = useCallback((): PossibleValues => {
    const initialCosts: Record<string, string> = {};

    for (const cost of bookingPrice.optional_house_costs) {
      initialCosts[cost.id] = '0';
    }

    const defaultValues = {
      ...initializeBookingFields(bookingFields),
      arrivalDate: arrivalDate!,
      departureDate: departureDate!,
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
      // Fixed at booking start; the selector is hidden once the form is open.
      // An empty string is dropped from the payload on single-currency portals.
      currency: selectedCurrency ?? '',
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
    persons,
    selectedCurrency
  ]);

  const [values, setValues] = useState<PossibleValues>(() =>
    createInitialValues()
  );
  const [touched, setTouched] = useState<BookingFormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<CreateBookingResponse | null>(null);
  // Validation errors returned by the API, keyed by booking field id.
  const [serverErrors, setServerErrors] = useState<BookingFormErrors>({});
  // The calendar popover under the date strip and, on phones, the summary
  // sheet behind the pinned total.
  const [datesOpen, setDatesOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [prices, setPrices] = useState<PricesType | null>(null);
  const openDates = useCallback(() => setDatesOpen(true), []);
  const closeDates = useCallback(() => setDatesOpen(false), []);

  // Dates changed from the popover flow into the values the summary and the
  // payload are built from.
  useEffect(() => {
    if (!arrivalDate || !departureDate) return;
    setValues((currentValues) =>
      currentValues.arrivalDate === arrivalDate &&
      currentValues.departureDate === departureDate
        ? currentValues
        : { ...currentValues, arrivalDate, departureDate }
    );
  }, [arrivalDate, departureDate]);

  const reset = useCallback(() => {
    setError(null);
    setServerErrors({});
  }, []);

  const setFieldValue = useCallback(
    (name: string, value: unknown) => {
      // A server-side error for this field is stale as soon as it is edited.
      setServerErrors((currentErrors) =>
        currentErrors[name] === undefined
          ? currentErrors
          : { ...currentErrors, [name]: undefined }
      );

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
    setTouched((currentTouched: BookingFormTouched) =>
      setByString(currentTouched, name, isTouched)
    );
  }, []);

  const sessionIdentifier = getSessionIdentifier();
  const errors: BookingFormErrors = useMemo(
    () => ({ ...serverErrors, ...validateForm(values, house, bookingFields) }),
    [bookingFields, house, serverErrors, values]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextErrors = validateForm(values, house, bookingFields);

      setTouched(createTouchedState(bookingFields, values));

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setServerErrors({});

      try {
        const booking = await createBooking({
          apiUrl,
          locale,
          payload: buildBookingPayload({
            values,
            objectCode,
            portalCode,
            locale,
            sessionIdentifier
          })
        });

        setData(booking);

        const redirect_urls = bookingFormConfiguration.redirect_urls ?? {};
        // The payment page wins over booking.redirect_url and a configured thank-you page.
        const redirectUrl =
          (booking.redirect_to_payment && booking.payment_url) ||
          booking.redirect_url ||
          redirect_urls[locale];
        if (redirectUrl && redirectUrl !== '') {
          redirectTo(redirectUrl);
        } else {
          setTimeout(() => {
            dispatch({
              type: 'return'
            });
          }, 15000);
        }
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError
            : new Error('The booking could not be created')
        );

        if (
          submitError instanceof CreateBookingError &&
          submitError.fieldErrors
        ) {
          const fieldErrors: BookingFormErrors = {};
          for (const [field, messages] of Object.entries(
            submitError.fieldErrors
          )) {
            fieldErrors[field] = messages.join(' ');
          }
          setServerErrors(fieldErrors);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      apiUrl,
      bookingFields,
      bookingFormConfiguration,
      dispatch,
      house,
      locale,
      objectCode,
      portalCode,
      sessionIdentifier,
      values
    ]
  );

  const popoverMonths = Math.min(
    2,
    Math.max(1, bookingFormConfiguration.show_months_amount || 2)
  );
  // A portal without its own button text still gets a readable CTA.
  const submitLabel = PortalSite.form_submit_button_text || t('book');
  const total = prices
    ? formatNumber(prices.total_costs.sub_total, {
        style: 'currency',
        currency: prices.currency
      })
    : null;

  const summary = (
    <>
      <Summary
        house={house}
        values={values}
        onChangeDates={openDates}
        onPrices={setPrices}
      />
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
              src={house.rental_terms ?? undefined}
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
        {submitLabel}
      </button>
    </>
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
      <form className="form bu-booking" onSubmit={handleSubmit}>
        {isSubmitting && (
          <div className="return-message">Creating booking...</div>
        )}
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

        <div className="bu-booking-head">
          <a
            className="return-link bu-link-button"
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
          <DateStrip
            house={house}
            persons={values.persons}
            onChange={openDates}
          />
          {datesOpen && (
            <DatePopover
              house={house}
              numberOfMonths={popoverMonths}
              numberOfMonthsInARow={popoverMonths}
              onClose={closeDates}
            />
          )}
        </div>

        <div className="bu-booking-body">
          <div className="form-content">
            <div className="form-section bup-16">
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

            <OptionalCosts
              costs={bookingPrice.optional_house_costs}
              currency={bookingPrice.currency}
            />

            <OptionalBookingFields
              bookingFields={bookingFields}
              errors={errors}
              touched={touched}
              PortalSite={PortalSite}
              values={values}
            />
          </div>

          <div className={`form-sum bup-16${summaryOpen ? ' bu-open' : ''}`}>
            <div className="bu-sheet-head">
              <span className="bu-sheet-title">{t('your_booking')}</span>
              <button
                type="button"
                className="bu-sheet-close"
                aria-label={t('close')}
                onClick={() => setSummaryOpen(false)}
              >
                <Close size={18} />
              </button>
            </div>
            {summary}
          </div>
          {summaryOpen && (
            <div
              className="bu-form-backdrop"
              onClick={() => setSummaryOpen(false)}
            />
          )}
        </div>

        {/* phones: the total pinned at the bottom opens the summary sheet */}
        <div className="bu-form-bar">
          <button
            type="button"
            className="bu-form-bar-total"
            aria-expanded={summaryOpen}
            onClick={() => setSummaryOpen(true)}
          >
            <span className="bu-form-bar-amount">{total ?? '—'}</span>
            <span className="bu-form-bar-hint">{t('view_breakdown')}</span>
          </button>
          <button
            className="bu-form-bar-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </BookingFormContext.Provider>
  );
}

export default FormCreator;
