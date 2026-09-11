import React from 'react';

const Calendar = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="3" y="4" width="14" height="13" rx="2" />
    <path d="M3 8h14M7 2v4M13 2v4" />
  </svg>
);

export default Calendar;
