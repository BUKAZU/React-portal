import React from 'react';

/** Thin arrow pointing right, drawn on the same 20px grid as the other icons. */
const Arrow = ({ size = 16 }: { size?: number }) => (
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
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
);

export default Arrow;
