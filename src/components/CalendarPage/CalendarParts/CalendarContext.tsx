import { differenceInCalendarDays, isAfter } from '../../../_lib/date_helper';
import React, { createContext, useReducer } from 'react';
import { BuDate, HouseType } from '../../../types';
import { Parse_EN_US } from '../../../_lib/date_helper';
import { BookingType } from '../calender_types';

export const initialBooking: BookingType = {
  selectedDate: null,
  arrivalDate: null,
  departureDate: null,
  bookingStarted: false,
  persons: 0,
  hoverDate: null,
  hoverValid: false
};

export type CalendarAction =
  | { type: 'clicked'; house: HouseType; day: BuDate }
  | { type: 'hover'; date: Date; valid: boolean }
  | { type: 'unhover' }
  | { type: 'reset' }
  | { type: 'start'; persons: number }
  | { type: 'return' }
  | { type: 'set_dates'; arrivalDate: BuDate; departureDate: BuDate };

export const CalendarContext = createContext<BookingType>(initialBooking);
export const CalendarContextDispatch = createContext<Function>(calendarReducer);

export function CalendarProvider({
  children,
  initialState
}: {
  children: React.ReactNode;
  /** Seed the calendar with dates, e.g. when re-picking from the form. */
  initialState?: Partial<BookingType>;
}): JSX.Element {
  const [booking_state, dispatch] = useReducer(calendarReducer, {
    ...initialBooking,
    ...initialState
  });
  return (
    <CalendarContext.Provider value={booking_state}>
      <CalendarContextDispatch.Provider value={dispatch}>
        {children}
      </CalendarContextDispatch.Provider>
    </CalendarContext.Provider>
  );
}

export function calendarReducer(
  bookingState: BookingType,
  action: CalendarAction
): BookingType {
  switch (action.type) {
    case 'clicked': {
      const { day, house } = action;
      const { selectedDate, arrivalDate } = bookingState;
      const date = Parse_EN_US(day.date);
      const defaultMaxPersons = house.persons > 2 ? 2 : house.persons;

      if (
        day.departure &&
        selectedDate &&
        arrivalDate &&
        isAfter(date, selectedDate) &&
        differenceInCalendarDays(date, selectedDate) <= house.max_nights &&
        differenceInCalendarDays(date, selectedDate) >=
          arrivalDate.min_nights &&
        differenceInCalendarDays(date, selectedDate) <= arrivalDate.max_nights
      ) {
        return {
          ...bookingState,
          departureDate: day,
          hoverDate: null,
          hoverValid: false
        };
      } else if (day.arrival) {
        return {
          ...bookingState,
          selectedDate: date,
          arrivalDate: day,
          departureDate: null,
          persons: bookingState.bookingStarted
            ? bookingState.persons
            : defaultMaxPersons,
          hoverDate: null,
          hoverValid: false
        };
      }
      return bookingState;
    }
    case 'hover': {
      return {
        ...bookingState,
        hoverDate: action.date,
        hoverValid: action.valid
      };
    }
    case 'unhover': {
      if (!bookingState.hoverDate) return bookingState;
      return { ...bookingState, hoverDate: null, hoverValid: false };
    }
    case 'set_dates': {
      return {
        ...bookingState,
        selectedDate: Parse_EN_US(action.arrivalDate.date),
        arrivalDate: action.arrivalDate,
        departureDate: action.departureDate,
        hoverDate: null,
        hoverValid: false
      };
    }
    case 'reset': {
      return initialBooking;
    }
    case 'start': {
      return {
        ...bookingState,
        bookingStarted: true,
        persons: action.persons
      };
    }
    case 'return': {
      return {
        ...bookingState,
        bookingStarted: false
      };
    }
    default: {
      throw Error('Unknown action: ' + (action as { type: string }).type);
    }
  }
}
