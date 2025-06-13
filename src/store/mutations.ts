import { Parse_EN_US } from '../_lib/date_helper';
import { differenceInCalendarDays, isAfter } from 'date-fns';

export default {
    selectDate(state: any, payload: any) {
        const { selectedDate, arrivalDate } = state.bookingState;
        const date = Parse_EN_US(payload.date);
        const defaultMaxPersons = payload.house.persons > 2 ? 2 : payload.house.persons;

        if (
            payload.departure &&
            selectedDate &&
            arrivalDate &&
            isAfter(date, selectedDate) &&
            differenceInCalendarDays(date, selectedDate) <= payload.house.max_nights &&
            differenceInCalendarDays(date, selectedDate) >=
            arrivalDate.min_nights &&
            differenceInCalendarDays(date, selectedDate) <= arrivalDate.max_nights
        ) {
            state.bookingState.departureDate = payload;
        }
        else if (payload.arrival) {
            state.bookingState = {
                ...state.bookingState,
                arrivalDate: payload,
                departureDate: null,
                persons: defaultMaxPersons,
                bookingStarted: false,
                selectedDate: date
            }
        }

        return state;
    },
    resetDates(state: any) {
        state.bookingState = {
            ...state.bookingState,
            arrivalDate: null,
            departureDate: null,
            persons: 2,
            bookingStarted: false,
            selectedDate: null
        }
        return state;
    }
};