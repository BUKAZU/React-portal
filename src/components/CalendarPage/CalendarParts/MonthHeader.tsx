import React from 'react';
import { MONTH_FORMAT, FormatIntl } from '../../../_lib/date_helper';
import { t } from '../../../intl';
import ChevronLeft from '../../icons/ChevronLeft.svg';
import ChevronRight from '../../icons/ChevronRight.svg';

interface Props {
  month: Date;
  /** Page the calendar back; rendered on the first visible month only. */
  onPrev?: () => void;
  /** Page the calendar forward; rendered on the last visible month only. */
  onNext?: () => void;
  /** The current month is the floor: there is nothing to book in the past. */
  prevDisabled?: boolean;
}

const MonthHeader = ({
  month,
  onPrev,
  onNext,
  prevDisabled = false
}: Props): JSX.Element => (
  <div className="bu-month-header bu-bold">
    {onPrev ? (
      <button
        type="button"
        className="bu-month-nav"
        aria-label={t('previous_month')}
        disabled={prevDisabled}
        onClick={onPrev}
      >
        <ChevronLeft />
      </button>
    ) : (
      <div className="bu-month-nav bu-month-nav-spacer" aria-hidden="true" />
    )}
    <div className="bu-month-title bu-text-center">
      <span>{FormatIntl(month, MONTH_FORMAT)}</span>
    </div>
    {onNext ? (
      <button
        type="button"
        className="bu-month-nav"
        aria-label={t('next_month')}
        onClick={onNext}
      >
        <ChevronRight />
      </button>
    ) : (
      <div className="bu-month-nav bu-month-nav-spacer" aria-hidden="true" />
    )}
  </div>
);

export default MonthHeader;
