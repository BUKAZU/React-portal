import React, { useContext, useEffect, useRef } from 'react';
import BookingForm from './BookingForm';
import GenerateCalendar from './CalendarParts/GenerateCalendar';
import {
  CalendarContext,
  CalendarProvider
} from './CalendarParts/CalendarContext';
import type { AppPortalSite } from '../loadPortalSite';
import { AppContext } from '../AppContext';
import { houseViewEntry, TrackEvent } from '../../_lib/Tracking';

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
  const { portalCode, objectCode, locale } = useContext(AppContext);
  const trackedHouse = useRef<string | null>(null);

  useEffect(() => {
    if (trackedHouse.current === objectCode) return;
    trackedHouse.current = objectCode;
    TrackEvent({
      house_code: objectCode,
      portal_code: portalCode,
      locale,
      interaction_type: 'house_view',
      interaction_info: { entry: houseViewEntry() }
    });
  }, [objectCode, portalCode, locale]);

  return (
    <CalendarProvider>
      <CalendarPage portalSite={portalSite} />
    </CalendarProvider>
  );
}

export default CalendarWrapper;
