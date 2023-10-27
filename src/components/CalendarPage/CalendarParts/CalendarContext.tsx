import { differenceInCalendarDays, isAfter } from 'date-fns';
import React, { createContext, useReducer } from 'react';
import { BuDate, HouseType } from '../../../types';
import { Parse_EN_US } from '../../../_lib/date_helper';
import { BookingType } from '../calender_types';

const initialBooking: BookingType = {
  selectedDate: null,
  arrivalDate: null,
  departureDate: null,
  bookingStarted: false,
  persons: 0
};

export const CalendarContext = createContext<BookingType>(initialBooking);
export const CalendarContextDispatch = createContext<Function>(calendarReducer);

export function CalendarProvider({
  children
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [booking_state, dispatch] = useReducer(calendarReducer, initialBooking);
  return (
    <CalendarContext.Provider value={booking_state}>
      <CalendarContextDispatch.Provider value={dispatch}>
        {children}
      </CalendarContextDispatch.Provider>
    </CalendarContext.Provider>
  );
}

function calendarReducer(
  bookingState: BookingType,
  action: { type: string; house: HouseType; day: BuDate; persons: number }
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
          departureDate: day
        };
      } else if (day.arrival) {
        return {
          bookingStarted: false,
          selectedDate: date,
          arrivalDate: day,
          departureDate: null,
          persons: defaultMaxPersons
        };
      }
      return bookingState;
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
      throw Error('Unknown action: ' + action.type);
    }
  }
}
