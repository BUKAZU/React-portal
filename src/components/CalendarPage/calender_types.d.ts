import { BuDate } from '../../types';

export type DatesType = {
  arrivalDate: BuDate;
  selectedDate: Date;
  departureDate: BuDate;
  startBooking: Boolean;
};

export type BookingType = {
  arrivalDate: BuDate | null;
  departureDate: BuDate | null;
  selectedDate: Date | null;
  bookingStarted: boolean;
  persons: number;
  /** Day under the pointer while a departure is still to be chosen. */
  hoverDate?: Date | null;
  /** Whether `hoverDate` is a valid departure for the chosen arrival. */
  hoverValid?: boolean;
};
