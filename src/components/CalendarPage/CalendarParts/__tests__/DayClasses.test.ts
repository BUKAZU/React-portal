import {
  addDays,
  subDays,
  startOfToday,
  startOfMonth,
  formatDateKey
} from '../../../../_lib/date_helper';
import DayClasses, { isDepartureCandidate } from '../DayClasses';

describe('DayClasses', () => {
  // Mock date for consistent testing
  const today = startOfToday();
  const todayString = formatDateKey(today);
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
      arrival: false,
      departure: false,
      max_nights: 12,
      min_nights: 0,
      special_offer: 0
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
        arrivalDate: {
          date: '2023-06-15',
          arrival: true,
          departure: true,
          min_nights: 3,
          max_nights: 7,
          special_offer: 0
        }
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

  it('should add booked class when the previous night is booked too', () => {
    const props = {
      ...defaultProps,
      buDate: { ...defaultProps.buDate, max_nights: 0 },
      prevBooked: { ...defaultProps.prevBooked, max_nights: 0 }
    };
    const result = DayClasses(props);
    expect(result).toContain('booked');
    expect(result).not.toContain('booked-departure');
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
    const testDay = addDays(today, 3); // Within last_minute_days
    const props = {
      ...defaultProps,
      day: testDay,
      // Ensure monthStart matches testDay's month so the day is not treated as
      // outside the current month (which would return early with 'disabled').
      monthStart: startOfMonth(testDay),
      house: {
        ...defaultProps.house,
        last_minute_days: 7
      }
    };
    const result = DayClasses(props);
    expect(result).toContain('discount');
  });

  it('should add discount class when day falls within a discount period', () => {
    const props = {
      ...defaultProps,
      discounts: [
        {
          discount_starts_at: formatDateKey(subDays(today, 2)),
          discount_ends_at: formatDateKey(addDays(today, 2))
        }
      ]
    };
    const result = DayClasses(props);
    expect(result).toContain('discount');
  });

  it('should handle selected date range', () => {
    const props = {
      ...defaultProps,
      dates: {
        selectedDate: today,
        departureDate: {
          date: '2023-06-17',
          arrival: true,
          departure: true,
          min_nights: 3,
          max_nights: 7,
          special_offer: 0
        },
        arrivalDate: {
          date: '2023-06-13',
          arrival: true,
          departure: true,
          min_nights: 3,
          max_nights: 7,
          special_offer: 0
        }
      }
    };
    const result = DayClasses(props);
    expect(result).toContain('selected');
  });

  it('should handle undefined prevBooked gracefully', () => {
    const props = {
      ...defaultProps,
      buDate: {
        ...defaultProps.buDate,
        arrival: true,
        max_nights: 7
      },
      prevBooked: undefined,
      day: today
    };
    const result = DayClasses(props);
    expect(result).toContain('arrival');
    expect(result).not.toContain('departure-arrival');
  });

  it('should add booked class when buDate.max_nights > 0 and prevBooked is undefined', () => {
    const props = {
      ...defaultProps,
      buDate: {
        ...defaultProps.buDate,
        arrival: false,
        max_nights: 5
      },
      prevBooked: undefined
    };
    const result = DayClasses(props);
    expect(result).toContain('booked');
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
        departureDate: {
          date: '2023-06-17',
          arrival: true,
          departure: true,
          min_nights: 3,
          max_nights: 7,
          special_offer: 0
        },
        arrivalDate: {
          date: '2023-06-13',
          arrival: true,
          departure: true,
          min_nights: 3,
          max_nights: 7,
          special_offer: 0
        }
      }
    };
    const result = DayClasses(props);
    expect(result).toContain('departure');
  });

  describe('stay and hover preview', () => {
    const arrivalDate = {
      date: todayString,
      arrival: true,
      departure: true,
      min_nights: 3,
      max_nights: 7,
      special_offer: 0
    };
    const departureDate = {
      ...arrivalDate,
      date: formatDateKey(addDays(today, 5))
    };
    const on = (day: Date, dates: object) =>
      DayClasses({
        ...defaultProps,
        day,
        monthStart: startOfMonth(day),
        buDate: {
          ...defaultProps.buDate,
          date: formatDateKey(day),
          departure: true
        },
        dates: {
          selectedDate: today,
          arrivalDate,
          departureDate: null,
          ...dates
        }
      });

    it('marks today and past days', () => {
      expect(DayClasses(defaultProps)).toContain('bu-today');
      const yesterday = subDays(today, 1);
      const result = DayClasses({
        ...defaultProps,
        day: yesterday,
        monthStart: startOfMonth(yesterday)
      });
      expect(result).toContain('bu-past');
      expect(result).not.toContain('bu-today');
    });

    it('paints the chosen stay over the availability colours', () => {
      const start = on(today, { departureDate });
      expect(start).toContain('bu-stay-start');
      expect(start).toContain('bu-stay-has-end');
      expect(on(addDays(today, 2), { departureDate })).toContain('bu-stay-in');
      expect(on(addDays(today, 5), { departureDate })).toContain('bu-stay-end');
      expect(on(addDays(today, 6), { departureDate })).not.toContain('bu-stay');
    });

    it('leaves the arrival open-ended until a departure is chosen', () => {
      const start = on(today, {});
      expect(start).toContain('bu-stay-start');
      expect(start).not.toContain('bu-stay-has-end');
      expect(start).not.toContain('bu-preview-start');
    });

    it('previews a valid hover as a dashed band', () => {
      const hover = { hoverDate: addDays(today, 4), hoverValid: true };
      expect(on(today, hover)).toContain('bu-preview-start');
      expect(on(addDays(today, 2), hover)).toContain('bu-preview-in');
      expect(on(addDays(today, 4), hover)).toContain('bu-preview-end');
      expect(on(addDays(today, 5), hover)).not.toContain('bu-preview');
    });

    it('marks an invalid hover only on the hovered day', () => {
      const hover = { hoverDate: addDays(today, 1), hoverValid: false };
      expect(on(addDays(today, 1), hover)).toContain('bu-preview-invalid');
      expect(on(today, hover)).not.toContain('bu-preview-start');
      const between = on(addDays(today, 2), {
        hoverDate: addDays(today, 4),
        hoverValid: false
      });
      expect(between).not.toContain('bu-preview-in');
    });

    it('ignores a hover before the arrival', () => {
      const hover = { hoverDate: subDays(today, 2), hoverValid: true };
      expect(on(today, hover)).not.toContain('bu-preview');
    });
  });

  describe('isDepartureCandidate', () => {
    it('is false without a chosen arrival', () => {
      expect(
        isDepartureCandidate({
          day: today,
          buDate: { ...defaultProps.buDate, departure: true },
          prevBooked: defaultProps.prevBooked,
          dates: { selectedDate: null, arrivalDate: null, departureDate: null },
          house: defaultProps.house
        })
      ).toBe(false);
    });
  });
});
