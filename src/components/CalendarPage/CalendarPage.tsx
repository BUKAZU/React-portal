import React, { useContext } from 'react';
import BookingForm from './BookingForm';
import GenerateCalendar from './CalendarParts/GenerateCalendar';
import { PortalSiteType } from '../../types';
import {
  CalendarContext,
  CalendarProvider
} from './CalendarParts/CalendarContext';

interface Props {
  PortalSite: PortalSiteType;
  objectCode: string;
  locale: string;
}

function CalendarPage({ PortalSite, objectCode, locale }: Props): JSX.Element {
  const { bookingStarted } = useContext(CalendarContext);

  if (bookingStarted) {
    return (
      <BookingForm
        portalCode={PortalSite.portal_code}
        objectCode={objectCode}
        locale={locale}
      />
    );
  } else {
    return (
      <GenerateCalendar
        PortalSite={PortalSite}
        objectCode={objectCode}
        locale={locale}
      />
    );
  }
}

CalendarPage.DefaultProps = {
  PortalSite: {
    options: {
      bookingForm: {
        numberOfMonths: 4,
        numberOfMonthsInARow: 2
      }
    }
  }
};

function CalendarWrapper({
  PortalSite,
  objectCode,
  locale
}: Props): JSX.Element {
  return (
    <CalendarProvider>
      <CalendarPage
        PortalSite={PortalSite}
        objectCode={objectCode}
        locale={locale}
      />
    </CalendarProvider>
  );
}

export default CalendarWrapper;
