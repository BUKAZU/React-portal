import React, { useContext } from 'react';
import BookingForm from './BookingForm';
import GenerateCalendar from './CalendarParts/GenerateCalendar';
import {
  CalendarContext,
  CalendarProvider
} from './CalendarParts/CalendarContext';
import type { AppPortalSite } from '../loadPortalSite';

interface Props {
  portalSite: AppPortalSite;
}

function CalendarPage({ portalSite }: Props): JSX.Element {
  const { bookingStarted } = useContext(CalendarContext);

  if (bookingStarted) {
    return <BookingForm portalSite={portalSite} />;
  } else {
    return <GenerateCalendar portalSite={portalSite} />;
  }
}

function CalendarWrapper({ portalSite }: Props): JSX.Element {
  return (
    <CalendarProvider>
      <CalendarPage portalSite={portalSite} />
    </CalendarProvider>
  );
}

export default CalendarWrapper;
