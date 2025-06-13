import { BookingType } from '../components/CalendarPage/calender_types';

const initialBooking: BookingType = {
  selectedDate: null,
  arrivalDate: null,
  departureDate: null,
  bookingStarted: false,
  persons: 0
};

export default {
  bookingState: initialBooking
};
