import React from "react";
import { MONTH_FORMAT, FormatIntl } from '../../../_lib/date_helper';

interface Props { month: Date; }

const MonthHeader = ({ month }:Props): JSX.Element => (    
      <div className="header bu-calendar-row flex-middle">
        <div className="bu-calendar-col col-center" style={{ textAlign: 'center' }}>
          <span>{FormatIntl(month, MONTH_FORMAT)}</span>
        </div>
      </div>
    );


export default MonthHeader