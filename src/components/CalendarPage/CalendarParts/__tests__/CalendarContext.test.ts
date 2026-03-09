import { addDays, startOfToday } from 'date-fns';
import { calendarReducer } from '../CalendarContext';
import { BookingType } from '../../calender_types';

const initialBooking: BookingType = {
    selectedDate: null,
    arrivalDate: null,
    departureDate: null,
    bookingStarted: false,
    persons: 0
};

const mockHouse = {
    id: 1,
    code: 'HOUSE001',
    name: 'Test House',
    house_type: 'house',
    persons: 6,
    bedrooms: 3,
    bathrooms: 2,
    minimum_week_price: 500,
    max_nights: 30,
    babies_extra: 0,
    city: 'Amsterdam',
    province: 'Noord-Holland',
    country_name: 'Netherlands',
    description: 'A nice house'
};

const today = startOfToday();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const mockArrivalDay = {
    date: todayStr,
    arrival: true,
    departure: false,
    min_nights: 3,
    max_nights: 14,
    special_offer: 0
};

describe('calendarReducer', () => {
    it('should return the initial state unchanged for an arrival click without dispatch', () => {
        const result = calendarReducer(initialBooking, {
            type: 'clicked',
            house: mockHouse as any,
            day: mockArrivalDay as any,
            persons: 0
        });
        expect(result.selectedDate).toEqual(today);
        expect(result.arrivalDate).toEqual(mockArrivalDay);
        expect(result.departureDate).toBeNull();
        expect(result.bookingStarted).toBe(false);
    });

    it('should set persons to min of 2 or house.persons when clicking an arrival day', () => {
        const result = calendarReducer(initialBooking, {
            type: 'clicked',
            house: mockHouse as any,
            day: mockArrivalDay as any,
            persons: 0
        });
        // house.persons = 6, defaultMaxPersons = min(6, 2) = 2
        expect(result.persons).toBe(2);
    });

    it('should set persons to house.persons when house.persons < 2', () => {
        const smallHouse = { ...mockHouse, persons: 1 };
        const result = calendarReducer(initialBooking, {
            type: 'clicked',
            house: smallHouse as any,
            day: mockArrivalDay as any,
            persons: 0
        });
        // house.persons = 1, defaultMaxPersons = 1 (since 1 <= 2)
        expect(result.persons).toBe(1);
    });

    it('should set departureDate when clicking a valid departure day', () => {
        const futureDate = addDays(today, 7);
        const futureDateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;

        const stateWithArrival: BookingType = {
            ...initialBooking,
            selectedDate: today,
            arrivalDate: mockArrivalDay as any
        };

        const departureDay = {
            date: futureDateStr,
            arrival: false,
            departure: true,
            min_nights: 3,
            max_nights: 14,
            special_offer: 0
        };

        const result = calendarReducer(stateWithArrival, {
            type: 'clicked',
            house: mockHouse as any,
            day: departureDay as any,
            persons: 0
        });
        expect(result.departureDate).toEqual(departureDay);
    });

    it('should not set departureDate when departure day does not meet min_nights constraint', () => {
        const tooSoonDate = addDays(today, 1); // Only 1 day, min is 3
        const tooSoonStr = `${tooSoonDate.getFullYear()}-${String(tooSoonDate.getMonth() + 1).padStart(2, '0')}-${String(tooSoonDate.getDate()).padStart(2, '0')}`;

        const stateWithArrival: BookingType = {
            ...initialBooking,
            selectedDate: today,
            arrivalDate: mockArrivalDay as any
        };

        const earlyDeparture = {
            date: tooSoonStr,
            arrival: false,
            departure: true,
            min_nights: 3,
            max_nights: 14,
            special_offer: 0
        };

        const result = calendarReducer(stateWithArrival, {
            type: 'clicked',
            house: mockHouse as any,
            day: earlyDeparture as any,
            persons: 0
        });
        expect(result.departureDate).toBeNull();
    });

    it('should reset to initial state on "reset" action', () => {
        const modifiedState: BookingType = {
            selectedDate: today,
            arrivalDate: mockArrivalDay as any,
            departureDate: null,
            bookingStarted: false,
            persons: 2
        };
        const result = calendarReducer(modifiedState, {
            type: 'reset',
            house: mockHouse as any,
            day: mockArrivalDay as any,
            persons: 0
        });
        expect(result).toEqual(initialBooking);
    });

    it('should set bookingStarted to true and update persons on "start" action', () => {
        const stateWithArrival: BookingType = {
            ...initialBooking,
            selectedDate: today,
            arrivalDate: mockArrivalDay as any,
            persons: 2
        };
        const result = calendarReducer(stateWithArrival, {
            type: 'start',
            house: mockHouse as any,
            day: mockArrivalDay as any,
            persons: 4
        });
        expect(result.bookingStarted).toBe(true);
        expect(result.persons).toBe(4);
    });

    it('should set bookingStarted to false on "return" action', () => {
        const activeState: BookingType = {
            ...initialBooking,
            bookingStarted: true,
            persons: 2
        };
        const result = calendarReducer(activeState, {
            type: 'return',
            house: mockHouse as any,
            day: mockArrivalDay as any,
            persons: 0
        });
        expect(result.bookingStarted).toBe(false);
    });

    it('should throw an error for unknown action types', () => {
        expect(() => {
            calendarReducer(initialBooking, {
                type: 'unknown_action',
                house: mockHouse as any,
                day: mockArrivalDay as any,
                persons: 0
            });
        }).toThrow('Unknown action: unknown_action');
    });
});
