import React, { useContext } from 'react';
import BookingForm from './BookingForm';
import GenerateCalendar from './CalendarParts/GenerateCalendar';
import {
  CalendarContext,
  CalendarProvider
} from './CalendarParts/CalendarContext';

function CalendarPage(): JSX.Element {
  const { bookingStarted } = useContext(CalendarContext);

  if (bookingStarted) {
    return <BookingForm />;
  } else {
    return <GenerateCalendar />;
  }
}

function CalendarWrapper(): JSX.Element {
  return (
    <CalendarProvider>
      <CalendarPage />
    </CalendarProvider>
  );
}

export default CalendarWrapper;
