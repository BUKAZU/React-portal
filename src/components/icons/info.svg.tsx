import React from 'react';

const Icon = ({ height = '16px', width = '16px' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    version="1.1"
    x="0px"
    y="0px"
    viewBox="0 0 100 100"
    enableBackground="new 0 0 100 100"
    xmlSpace="preserve"
    style={{
      height,
      width
    }}
  >
    <path d="M50,5c24.813,0,45,20.187,45,45c0,24.813-20.187,45-45,45C25.187,95,5,74.813,5,50C5,25.187,25.187,5,50,5   M50,0C22.386,0,0,22.386,0,50c0,27.614,22.386,50,50,50c27.614,0,50-22.386,50-50C100,22.386,77.614,0,50,0L50,0z" />
    <circle cx="50" cy="29.546" r="4.934" />
    <rect x="46.5" y="41.21" width="7" height="34.179" />
  </svg>
);

export default Icon;
