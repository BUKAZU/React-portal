import {
  buildBookingsUrl,
  createBooking,
  CreateBookingError,
  CreateBookingResponse
} from '../create_booking';
import type { CreateBookingPayload } from '../booking_payload';
import { HTTPError } from 'ky';

// Explicit factory mock for the shared HTTP client so tests do not perform real HTTP requests.
jest.mock('../http_client', () => ({
  http: { post: jest.fn() }
}));
import { http } from '../http_client';

const mockHttp = http as jest.Mocked<typeof http>;

function httpErrorWith(status: number, body: unknown, parseable = true) {
  const response = {
    status,
    json: parseable
      ? jest.fn().mockResolvedValue(body)
      : jest.fn().mockRejectedValue(new SyntaxError('Unexpected token <'))
  } as unknown as Response;
  const request = {
    method: 'POST',
    url: 'https://example.com'
  } as Request;

  return new HTTPError(response, request, {} as never);
}

describe('bookings REST client', () => {
  const payload: CreateBookingPayload = {
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
  };

  const response: CreateBookingResponse = {
    booking_nr: 'B2600123',
    status: 'new',
    is_option: false,
    arrival_date: '2025-07-01',
    departure_date: '2025-07-08',
    adults: 2,
    children: 0,
    babies: 0,
    language: 'nl',
    payment_url: 'https://payments.bukazu.com/1/token?locale=nl',
    redirect_url: null,
    success_message: 'Boeking aangemaakt',
    portal_code: 'TEST',
    house_code: 'HOUSE1',
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildBookingsUrl', () => {
    it('derives the REST origin from the GraphQL api_url', () => {
      const url = new URL(
        buildBookingsUrl({ apiUrl: 'https://api.bukazu.com/graphql' })
      );

      expect(url.origin).toBe('https://api.bukazu.com');
      expect(url.pathname).toBe('/portal_api/v1/accommodations/bookings');
    });

    it('respects a custom (staging/local) api_url origin', () => {
      const url = new URL(
        buildBookingsUrl({ apiUrl: 'http://localhost:3000/graphql' })
      );

      expect(url.origin).toBe('http://localhost:3000');
      expect(url.pathname).toBe('/portal_api/v1/accommodations/bookings');
    });
  });

  describe('createBooking', () => {
    it('posts the payload with the locale header and returns the parsed booking', async () => {
      const mockJson = jest.fn().mockResolvedValue(response);
      (mockHttp.post as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await createBooking({
        apiUrl: 'https://api.bukazu.com/graphql',
        locale: 'nl',
        payload
      });

      expect(result).toEqual(response);

      const [calledUrl, calledOptions] = (mockHttp.post as jest.Mock).mock
        .calls[0];
      expect(calledUrl).toContain('/portal_api/v1/accommodations/bookings');
      expect(
        (
          calledOptions as {
            json: CreateBookingPayload;
            headers: Record<string, string>;
          }
        ).json
      ).toEqual(payload);
      expect(
        (calledOptions as { headers: Record<string, string> }).headers.locale
      ).toBe('nl');
    });

    it('maps a 422 body onto messages and field errors', async () => {
      (mockHttp.post as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(
          httpErrorWith(422, {
            error: 'moet opgegeven zijn',
            errors: {
              first_name: ['moet opgegeven zijn'],
              'extra_fields.date_of_birth': ['moet opgegeven zijn']
            }
          })
        )
      });

      await expect(
        createBooking({
          apiUrl: 'https://api.bukazu.com/graphql',
          locale: 'nl',
          payload
        })
      ).rejects.toMatchObject({
        name: 'CreateBookingError',
        status: 422,
        messages: ['moet opgegeven zijn'],
        fieldErrors: {
          first_name: ['moet opgegeven zijn'],
          'extra_fields.date_of_birth': ['moet opgegeven zijn']
        }
      });
    });

    it('maps a 400 body without field errors', async () => {
      (mockHttp.post as jest.Mock).mockReturnValue({
        json: jest
          .fn()
          .mockRejectedValue(
            httpErrorWith(400, { error: 'starts_at is missing' })
          )
      });

      const error: CreateBookingError = await createBooking({
        apiUrl: 'https://api.bukazu.com/graphql',
        locale: 'nl',
        payload
      }).catch((thrown) => thrown);

      expect(error).toBeInstanceOf(CreateBookingError);
      expect(error.status).toBe(400);
      expect(error.message).toBe('starts_at is missing');
      expect(error.fieldErrors).toBeUndefined();
    });

    it('falls back to the status when the error body is not JSON', async () => {
      (mockHttp.post as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(httpErrorWith(500, '<html>', false))
      });

      const error: CreateBookingError = await createBooking({
        apiUrl: 'https://api.bukazu.com/graphql',
        locale: 'nl',
        payload
      }).catch((thrown) => thrown);

      expect(error).toBeInstanceOf(CreateBookingError);
      expect(error.status).toBe(500);
      expect(error.messages).toEqual(['Booking request failed (500)']);
    });

    it('re-throws non-HTTP errors unchanged', async () => {
      (mockHttp.post as jest.Mock).mockReturnValue({
        json: jest.fn().mockRejectedValue(new Error('Network failure'))
      });

      await expect(
        createBooking({
          apiUrl: 'https://api.bukazu.com/graphql',
          locale: 'nl',
          payload
        })
      ).rejects.toThrow('Network failure');
    });
  });
});
