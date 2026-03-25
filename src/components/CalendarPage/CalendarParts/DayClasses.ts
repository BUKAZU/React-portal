import {
  addDays,
  differenceInCalendarDays,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  subDays
} from 'date-fns';
import { BuDate } from '../../../types';
import { Parse_EN_US } from '../../../_lib/date_helper';

interface Discount {
  discount_starts_at: string;
  discount_ends_at: string;
}

interface Props {
  day: Date;
  monthStart: Date;
  prevBooked?: BuDate;
  buDate: BuDate;
  dates: {
    selectedDate: Date | null;
    departureDate: BuDate | null;
    arrivalDate: BuDate | null;
  };
  house: {
    max_nights: number;
    last_minute_days: number;
  };
  discounts: Discount[];
}

function DayClasses({
  day,
  monthStart,
  buDate,
  prevBooked,
  dates,
  house,
  discounts
}: Props): string {
  const { selectedDate, departureDate, arrivalDate } = dates;
  let classes = [
    'bu-grid',
    'bu-center',
    'bu-rounded-half',
    'bu-h-42',
    'bu-w-42'
  ];

  if (!isSameMonth(day, monthStart)) {
    classes.push('disabled');
    return classes.join(' ');
  }
  if (buDate) {
    if (
      buDate.arrival &&
      isAfter(day, subDays(new Date(), 1)) &&
      buDate.max_nights !== 0
    ) {
      if (prevBooked?.max_nights === 0) {
        classes.push('departure-arrival', 'bu-hover-bright');
      } else {
        classes.push('arrival', 'bu-hover-bright');
      }
    } else if (buDate.max_nights === 0) {
      if (prevBooked?.max_nights !== 0) {
        classes.push('booked-departure', 'bu-hover-bright');
      } else {
        classes.push('booked');
      }
    } else if (
      buDate.max_nights > 0 &&
      (prevBooked?.max_nights ?? 0) === 0 &&
      !buDate.arrival
    ) {
      classes.push('booked');
    }
  }

  if (selectedDate) {
    if (isSameDay(day, selectedDate)) {
      classes.push('selected');
    }
    const minimum =
      differenceInCalendarDays(day, selectedDate) >= (arrivalDate?.min_nights ?? 0);
    const maximum =
      differenceInCalendarDays(day, selectedDate) <= house.max_nights &&
      differenceInCalendarDays(day, selectedDate) <= (arrivalDate?.max_nights ?? 0);

    if (
      buDate.departure &&
      isAfter(day, selectedDate) &&
      minimum &&
      maximum &&
      prevBooked?.max_nights !== 0
    ) {
      classes.push('departure');
    }
  }

  if (departureDate && selectedDate) {
    if (
      isAfter(day, selectedDate) &&
      isBefore(day, Parse_EN_US(departureDate.date))
    ) {
      classes.push('selected');
    }
    if (isSameDay(day, Parse_EN_US(departureDate.date))) {
      classes.push('selected');
    }
  }

  const daysFromToday = differenceInCalendarDays(day, new Date());
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
