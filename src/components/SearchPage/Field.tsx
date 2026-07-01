import React from 'react';
import List from './filters/List';
import { createNumberArray, createPriceArray } from './filters/helper';
import Select from './filters/Select';
import Radio from './filters/Radio';
import DateFilter from './filters/DateFilter';
import NumberFilter from './filters/NumberFilter';
import type { AppPortalSite } from '../loadPortalSite';
import { Field as FieldType, FiltersType, OptionsType } from './filters/filter_types';

interface Props {
  PortalSite: AppPortalSite;
  field: FieldType;
  filters: FiltersType;
  value: string;
  onFilterChange: Function;
}

const NUMERIC_SELECT_FIELDS = [
  'persons_min',
  'persons_max',
  'bedrooms_min',
  'bathrooms_min',
  'weekprice_max'
];
const VALID_TYPES = ['select', 'list', 'radio', 'number', 'date'];

function Field({
  PortalSite,
  field,
  filters,
  value,
  onFilterChange
}: Props): JSX.Element {
  let options: unknown[] = [];
  if (field.options) {
    options = field.options;
  } else if (field.max !== undefined) {
    options = field.id === 'weekprice_max'
      ? createPriceArray(field.max)
      : createNumberArray(field.max);
  } else if (['countries', 'cities', 'regions'].includes(field.id)) {
    options = (PortalSite[field.id] as unknown[]) || [];
  }

  const effectiveType =
    !VALID_TYPES.includes(field.type) &&
    NUMERIC_SELECT_FIELDS.includes(field.id)
      ? 'select'
      : field.type;

  if (effectiveType === 'select') {
    return <Select options={options as OptionsType[]} field={field} filters={filters} value={value} onChange={onFilterChange} />;
  } else if (effectiveType === 'list') {
    return <List options={options as OptionsType[]} field={field} filters={filters} value={value} onChange={onFilterChange} />;
  } else if (effectiveType === 'radio') {
    return <Radio options={options as (OptionsType | string)[]} field={field} filters={filters} onChange={onFilterChange} />;
  } else if (effectiveType === 'number') {
    return (
      <NumberFilter
        PortalSite={PortalSite}
        field={field}
        value={value}
        onChange={onFilterChange}
      />
    );
  } else if (effectiveType === 'date') {
    return <DateFilter field={field} value={value} onChange={onFilterChange} />;
  } else {
    return (
      <input
        value={value}
        onBlur={(event) => {
          onFilterChange(field.id, event.target.value);
        }}
      />
    );
  }
}

export default Field;
