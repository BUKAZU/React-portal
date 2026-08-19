import { buildBookingPayload } from '../booking_payload';
import type { PossibleValues } from '../../components/CalendarPage/formParts/form_types';

function buildValues(overrides: Partial<PossibleValues> = {}): PossibleValues {
  return {
    arrivalDate: { date: '2025-07-01' },
    departureDate: { date: '2025-07-08' },
    is_option: 'false',
    costs: {},
    adults: 2,
    children: 0,
    babies: 0,
    persons: 2,
    discount: 0,
    country: 'nl',
    cancel_insurance: '0',
    discount_code: '',
    extra_fields: {},
    ...overrides
  } as PossibleValues;
}

const baseParams = {
  objectCode: 'HOUSE1',
  portalCode: 'TEST',
  locale: 'nl',
  sessionIdentifier: null
};

describe('buildBookingPayload', () => {
  it('maps the required form values onto the REST param names', () => {
    const payload = buildBookingPayload({
      ...baseParams,
      values: buildValues()
    });

    expect(payload).toEqual({
      portal_code: 'TEST',
      object_code: 'HOUSE1',
      starts_at: '2025-07-01',
      ends_at: '2025-07-08',
      is_option: false,
      language: 'nl',
      country: 'NL',
      adults: 2,
      children: 0,
      babies: 0,
      discount: 0,
      cancel_insurance: 0,
      costs: {}
    });
  });

  it('does not leak internal form state', () => {
    const payload = buildBookingPayload({
      ...baseParams,
      values: buildValues({ unknown_booking_field: 'leaked' })
    });

    expect(payload).not.toHaveProperty('arrivalDate');
    expect(payload).not.toHaveProperty('departureDate');
    expect(payload).not.toHaveProperty('persons');
    expect(payload).not.toHaveProperty('unknown_booking_field');
    expect(payload).not.toHaveProperty('house_code');
    expect(payload).not.toHaveProperty('arrival_date');
  });

  it('converts is_option to a boolean', () => {
    expect(
      buildBookingPayload({
        ...baseParams,
        values: buildValues({ is_option: 'true' })
      }).is_option
    ).toBe(true);
  });

  it('coerces numeric values and falls back to 0', () => {
    const payload = buildBookingPayload({
      ...baseParams,
      values: buildValues({
        adults: '3' as unknown as number,
        children: '' as unknown as number,
        babies: 1,
        discount: '10' as unknown as number,
        cancel_insurance: '2'
      })
    });

    expect(payload).toMatchObject({
      adults: 3,
      children: 0,
      babies: 1,
      discount: 10,
      cancel_insurance: 2
    });
  });

  it('sends costs as an object of positive quantities', () => {
    const payload = buildBookingPayload({
      ...baseParams,
      values: buildValues({ costs: { '12': '2', '34': '0', '56': '' } })
    });

    expect(payload.costs).toEqual({ '12': 2 });
  });

  it('sends extra_fields as an object, omitting blank entries', () => {
    const payload = buildBookingPayload({
      ...baseParams,
      values: buildValues({
        extra_fields: { date_of_birth: '1988-10-14', destination: '  ' }
      })
    });

    expect(payload.extra_fields).toEqual({ date_of_birth: '1988-10-14' });
  });

  it('omits extra_fields entirely when there is nothing to send', () => {
    const payload = buildBookingPayload({
      ...baseParams,
      values: buildValues({ extra_fields: { destination: '' } })
    });

    expect(payload).not.toHaveProperty('extra_fields');
  });

  it('includes the configured booking fields when filled in', () => {
    const payload = buildBookingPayload({
      ...baseParams,
      values: buildValues({
        first_name: 'Jane',
        last_name: ' Doe ',
        email: 'jane@example.com',
        phone: '',
        comment: 'Late arrival',
        discount_code: 'SUMMER10'
      })
    });

    expect(payload).toMatchObject({
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      comment: 'Late arrival',
      discount_code: 'SUMMER10'
    });
    expect(payload).not.toHaveProperty('phone');
  });

  it('includes the session identifier only when one is known', () => {
    expect(
      buildBookingPayload({
        ...baseParams,
        sessionIdentifier: 'SESSION123',
        values: buildValues()
      }).session_identifier
    ).toBe('SESSION123');

    expect(
      buildBookingPayload({ ...baseParams, values: buildValues() })
    ).not.toHaveProperty('session_identifier');
  });
});
