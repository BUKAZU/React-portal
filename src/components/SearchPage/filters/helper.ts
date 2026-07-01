export function createNumberArray(max_number: number): number[] {
  return Array.from({ length: max_number + 1 }, (v, k) => k);
}

export function createPriceArray(max_price: number): number[] {
  let rounded = Math.ceil(max_price / 100);
  return Array.from({ length: rounded + 1 }, (v, k) => k * 100);
}

import type { Field } from './filter_types';

export const defaultFilter: Field[] = [
  {
    label: 'Land',
    id: 'countries',
    type: 'select'
  }
];
