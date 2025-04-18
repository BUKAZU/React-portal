import React from 'react';
import { MONTH_FORMAT, FormatIntl } from '../../../_lib/date_helper';

interface Props {
  month: Date;
}

const MonthHeader = ({ month }: Props): JSX.Element => (
  <div className="bu_flex bu_items-center">
    <div className="bu_text-center">
      <span>{FormatIntl(month, MONTH_FORMAT)}</span>
    </div>
  </div>
);

export default MonthHeader;
