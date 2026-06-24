import { subYears, isAfter } from '../../../_lib/date_helper';
import React from 'react';
import { t } from '../../../intl';
import { HouseType } from '../../../types';
import { PossibleValues } from './form_types';

export function createPeronsArray(persons: number): number[] {
  return Array.apply(null, { length: persons + 1 }).map(Number.call, Number);
}

export function initializeBookingFields(
  bookingFields: Array<{ id: string }>
): Record<string, string> {
  const initialFields: Record<string, string> = {};

  bookingFields.forEach((field) => {
    initialFields[field.id] = '';
  });

  return initialFields;
}

function getPathSegments(path: string): string[] {
  return path
    .replace(/\[(\w+)\]/g, '.$1')
    .replace(/^\./, '')
    .split('.');
}

export function byString(o: unknown, path: string): unknown {
  const segments = getPathSegments(path);
  let value = o;

  for (const segment of segments) {
    if (
      value !== null &&
      typeof value === 'object' &&
      segment in (value as Record<string, unknown>)
    ) {
      value = (value as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  return value;
}

export function setByString<T extends Record<string, unknown>>(
  source: T,
  path: string,
  value: unknown
): T {
  const segments = getPathSegments(path);
  const result: Record<string, unknown> = Array.isArray(source)
    ? [...source]
    : { ...source };
  let currentResult: Record<string, unknown> = result;
  let currentSource: unknown = source;

  segments.forEach((segment, index) => {
    const isLeaf = index === segments.length - 1;

    if (isLeaf) {
      currentResult[segment] = value;
      return;
    }

    const sourceBranch =
      currentSource !== null && typeof currentSource === 'object'
        ? (currentSource as Record<string, unknown>)[segment]
        : undefined;

    const nextBranch =
      sourceBranch !== null &&
      typeof sourceBranch === 'object' &&
      !Array.isArray(sourceBranch)
        ? { ...(sourceBranch as Record<string, unknown>) }
        : {};

    currentResult[segment] = nextBranch;
    currentResult = nextBranch;
    currentSource = sourceBranch;
  });

  return result as T;
}

export function calculatePersons(
  house: HouseType,
  values: Pick<PossibleValues, 'adults' | 'children' | 'babies'>
): number {
  let babies = Number(values.babies) - Number(house.babies_extra);

  if (babies < 0) {
    babies = 0;
  }

  return Number(values.children) + Number(values.adults) + babies;
}

export function translatedOption(id: string, value: string): JSX.Element {
  return <option value={value}>{t(id)}</option>;
}

export function validateAge(value: string): boolean {
  const dob = new Date(value);
  const minAge = subYears(new Date(), 18);

  if (isAfter(dob, minAge)) {
    return true;
  }

  return false;
}
