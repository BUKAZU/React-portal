import { useQuery } from '@apollo/client';
import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { HouseType, PortalSiteType } from '../../../types';
import { SINGLE_HOUSE_QUERY } from '../../../_lib/queries';
import { AppContext } from '../../AppContext';
import { ApiError } from '../../Error';
import Loading from '../../icons/loading.svg';
import Calendar from '../Calendar';
import { TrackEvent } from '../../../_lib/Tracking';

interface Props {
  PortalSite: PortalSiteType;
}

function GenerateCalendar({ PortalSite }: Props): JSX.Element {
  const { portalCode, objectCode, locale } = useContext(AppContext);
  const { loading, error, data } = useQuery(SINGLE_HOUSE_QUERY, {
    variables: { portalCode, objectCode }
  });

  TrackEvent({
    house_code: objectCode,
    portal_code: portalCode,
    interaction_type: 'calendar_view',
    locale: locale
  });

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error) {
    return (
      <div>
        <ApiError errors={error} />
      </div>
    );
  }

  const Results = data.PortalSite.houses;
  const numberOfMonths = PortalSite.options.bookingForm
    ? PortalSite.options.bookingForm.numberOfMonths
    : 4;
  const numberOfMonthsInARow = PortalSite.options.bookingForm
    ? PortalSite.options.bookingForm.numberOfMonthsInARow
    : 4;

  return (
    <div id="calendar-container">
      {Results.length === 0 && (
        <div>
          <FormattedMessage id="no_house_found" />
        </div>
      )}
      {Results.map((result: HouseType) => (
        <div key={result.id}>
          <div className="house-name">{result.name}</div>
          <Calendar
            numberOfMonths={numberOfMonths}
            numberOfMonthsInARow={numberOfMonthsInARow}
            house={result}
          />
        </div>
      ))}
    </div>
  );
}

export default GenerateCalendar;
