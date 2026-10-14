import {
  addDays,
  differenceInCalendarDays,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  subDays
} from '../../../_lib/date_helper';
import { BuDate, Discount } from '../../../types';
import { Parse_EN_US } from '../../../_lib/date_helper';

interface Props {
  day: Date;
  monthStart: Date;
  prevBooked?: BuDate;
  buDate: BuDate;
  dates: {
    selectedDate: Date | null;
    departureDate: BuDate | null;
    arrivalDate: BuDate | null;
    hoverDate?: Date | null;
    hoverValid?: boolean;
  };
  house: {
    max_nights: number;
    last_minute_days: number;
  };
  discounts: Discount[];
}

/**
 * Whether `day` can end a stay that starts on `selectedDate`: the API marks it
 * as a departure day, it lies after the arrival, respects the arrival day's
 * minimum and maximum stay and the night before it is not booked.
 */
export function isDepartureCandidate({
  day,
  buDate,
  prevBooked,
  dates,
  house
}: Omit<Props, 'monthStart' | 'discounts'>): boolean {
  const { selectedDate, arrivalDate } = dates;
  if (!selectedDate) return false;

  const dayDiff = differenceInCalendarDays(day, selectedDate);
  const minimum = dayDiff >= (arrivalDate?.min_nights ?? 0);
  const maximum =
    dayDiff <= house.max_nights && dayDiff <= (arrivalDate?.max_nights ?? 0);

  return (
    buDate.departure &&
    isAfter(day, selectedDate) &&
    minimum &&
    maximum &&
    prevBooked !== undefined &&
    prevBooked.max_nights !== 0
  );
}

/**
 * Class list for one calendar cell.
 *
 * Availability classes (`arrival`, `departure`, `booked`, `booked-departure`,
 * `departure-arrival`, `discount`) describe what the day allows. The stay
 * classes (`bu-stay-start`, `bu-stay-in`, `bu-stay-end`) and the hover preview
 * classes (`bu-preview-in`, `bu-preview-end`, `bu-preview-invalid`) paint over
 * them once the visitor is choosing.
 */
function DayClasses({
  day,
  monthStart,
  buDate,
  prevBooked,
  dates,
  house,
  discounts
}: Props): string {
  const { selectedDate, departureDate, arrivalDate, hoverDate, hoverValid } =
    dates;
  const today = new Date();
  const classes = ['bu-day'];

  if (!isSameMonth(day, monthStart)) {
    classes.push('disabled');
    return classes.join(' ');
  }
  if (isBefore(day, subDays(today, 1))) {
    classes.push('bu-past');
  }
  if (buDate) {
    if (
      buDate.arrival &&
      isAfter(day, subDays(today, 1)) &&
      buDate.max_nights !== 0
    ) {
      if (prevBooked?.max_nights === 0) {
        classes.push('departure-arrival');
      } else {
        classes.push('arrival');
      }
    } else if (buDate.max_nights === 0) {
      if (prevBooked !== undefined && prevBooked.max_nights !== 0) {
        classes.push('booked-departure');
      } else {
        classes.push('booked');
      }
    } else if (
      buDate.max_nights > 0 &&
      (prevBooked === undefined || prevBooked.max_nights === 0) &&
      !buDate.arrival
    ) {
      classes.push('booked');
    }
  }

  if (isSameDay(day, today)) {
    classes.push('bu-today');
  }

  if (selectedDate) {
    if (isSameDay(day, selectedDate)) {
      classes.push('selected', 'bu-stay-start');
      if (departureDate) {
        classes.push('bu-stay-has-end');
      } else if (hoverDate && hoverValid && isAfter(hoverDate, selectedDate)) {
        classes.push('bu-preview-start');
      }
    }

    if (isDepartureCandidate({ day, buDate, prevBooked, dates, house })) {
      classes.push('departure');
    }
  }

  if (departureDate && selectedDate) {
    const departureDateParsed = Parse_EN_US(departureDate.date);
    if (isAfter(day, selectedDate) && isBefore(day, departureDateParsed)) {
      classes.push('selected', 'bu-stay-in');
    }
    if (isSameDay(day, departureDateParsed)) {
      classes.push('selected', 'bu-stay-end');
    }
  } else if (selectedDate && hoverDate && isAfter(hoverDate, selectedDate)) {
    // Preview of the stay while the pointer rests on a possible departure.
    if (isSameDay(day, hoverDate)) {
      classes.push(
        'bu-preview',
        hoverValid ? 'bu-preview-end' : 'bu-preview-invalid'
      );
    } else if (
      hoverValid &&
      isAfter(day, selectedDate) &&
      isBefore(day, hoverDate)
    ) {
      classes.push('bu-preview', 'bu-preview-in');
    }
  }

  const daysFromToday = differenceInCalendarDays(day, today);
  const last_minute =
    daysFromToday <= house.last_minute_days && daysFromToday > 0;

  const discount = discounts.find(
    (x) =>
      isBefore(subDays(Parse_EN_US(x.discount_starts_at), 1), day) &&
      isAfter(addDays(Parse_EN_US(x.discount_ends_at), 1), day)
  );
  if (last_minute || discount || buDate.special_offer > 0) {
    classes.push('discount');
  }

  return classes.join(' ');
}

export default DayClasses;
