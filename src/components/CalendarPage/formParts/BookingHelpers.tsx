import { subYears, isAfter } from 'date-fns'
import React from 'react'
import { t } from '../../../intl';

export function createPeronsArray(persons: number): number[] {
  return Array.apply(null, { length: persons + 1 }).map(Number.call, Number);
}

export function initializeBookingFields(bookingFields: any[]) {
  let obj = {};
  bookingFields.map((field) => {
    obj[field.id] = '';
  });
  return obj;
}

export function byString(o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, ''); // strip a leading dot
  var a = s.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
}

export function translatedOption(id:string, value: string):JSX.Element {
  return (
    <option value={value}>{t(id)}</option>
  );
}

export function validateAge(string) {
  const dob = new Date(string)
  const minAge = subYears(new Date(), 18)

  if (isAfter(dob, minAge)) {
    return true;
  } else return false;
}
