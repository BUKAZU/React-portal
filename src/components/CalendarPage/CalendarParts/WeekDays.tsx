import { startOfWeek, addDays } from "date-fns";
import React from "react";
import { FormatIntl } from "../../../_lib/date_helper";

interface Props {
    month: Date
}

function WeekDays({ month }: Props):JSX.Element {
const dateFormat = 'E';
    let days: JSX.Element[] = [];

    let startDate: Date = startOfWeek(month);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="bu-calendar-col col-center" key={i}>
          {FormatIntl(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="days bu-calendar-row">{days}</div>;
    
}

export default WeekDays