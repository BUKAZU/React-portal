import { addDays, subDays, startOfToday, startOfMonth, format } from 'date-fns';
import DayClasses from '../DayClasses';

describe('DayClasses', () => {
    // Mock date for consistent testing
    const today = startOfToday();
    const tomorrow = addDays(today, 1);
    const todayString = format(today, 'yyyy-MM-dd');
    const monthStart = startOfMonth(today);

    // Default test props
    const defaultProps = {
        day: today,
        monthStart,
        buDate: {
            date: todayString,
            arrival: false,
            departure: false,
            min_nights: 3,
            max_nights: 2,
            special_offer: 0
        },
        prevBooked: {
            date: '2023-06-14',
            max_nights: 12,
            min_nights: 0
        },
        dates: {
            selectedDate: null,
            departureDate: null,
            arrivalDate: null
        },
        house: {
            max_nights: 30,
            last_minute_days: 7
        },
        discounts: []
    };

    it('should return disabled class for days outside current month', () => {
        const nextMonth = addDays(monthStart, 35); // Definitely in next month
        const result = DayClasses({ ...defaultProps, day: nextMonth });
        expect(result).toContain('disabled');
    });

    it('should add selected class when day is selected', () => {
        const props = {
            ...defaultProps,
            dates: {
                selectedDate: today,
                departureDate: null,
                arrivalDate: { date: '2023-06-15', arrival: true, departure: true, min_nights: 3, max_nights: 7, special_offer: 0 }
            }
        };
        const result = DayClasses(props);
        expect(result).toContain('selected');
    });

    it('should add departure-arrival class for available arrival days', () => {
        const props = {
            ...defaultProps,
            buDate: {
                ...defaultProps.buDate,
                arrival: true,
                max_nights: 7
            },
            prevBooked: {
                ...defaultProps.prevBooked,
                max_nights: 0
            },
            day: today
        };
        const result = DayClasses(props);
        expect(result).toContain('departure-arrival');
    });

    it('should add arrival class for available arrival days', () => {
        const props = {
            ...defaultProps,
            buDate: {
                ...defaultProps.buDate,
                arrival: true,
                max_nights: 7
            },
            prevBooked: {
                ...defaultProps.prevBooked,
                max_nights: 0
            },
            day: today
        };
        const result = DayClasses(props);
        expect(result).toContain('arrival');
    });

    it('should add booked class for unavailable days', () => {
        const props = {
            ...defaultProps,
            buDate: {
                ...defaultProps.buDate,
                max_nights: 0
            }
        };
        const result = DayClasses(props);
        expect(result).toContain('booked');
    });

    it('should add discount class when there is a special offer', () => {
        const props = {
            ...defaultProps,
            buDate: {
                ...defaultProps.buDate,
                special_offer: 10
            }
        };
        const result = DayClasses(props);
        expect(result).toContain('discount');
    });

    it('should handle last minute discount', () => {
        const props = {
            ...defaultProps,
            day: addDays(today, 3), // Within last_minute_days
            house: {
                ...defaultProps.house,
                last_minute_days: 7
            }
        };
        const result = DayClasses(props);
        expect(result).toContain('discount');
    });

    it('should handle selected date range', () => {
        const props = {
            ...defaultProps,
            dates: {
                selectedDate: today,
                departureDate: { date: '2023-06-17', arrival: true, departure: true, min_nights: 3, max_nights: 7, special_offer: 0 },
                arrivalDate: { date: '2023-06-13', arrival: true, departure: true, min_nights: 3, max_nights: 7, special_offer: 0 }
            }
        };
        const result = DayClasses(props);
        expect(result).toContain('selected');
    });

    it('should handle departure day', () => {
        const props = {
            ...defaultProps,
            buDate: {
                ...defaultProps.buDate,
                departure: true
            },
            dates: {
                selectedDate: subDays(today, 3),
                departureDate: { date: '2023-06-17', arrival: true, departure: true, min_nights: 3, max_nights: 7, special_offer: 0 },
                arrivalDate: { date: '2023-06-13', arrival: true, departure: true, min_nights: 3, max_nights: 7, special_offer: 0 }
            }
        };
        const result = DayClasses(props);
        expect(result).toContain('departure');
    });
});
