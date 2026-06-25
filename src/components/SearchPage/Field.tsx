import React from 'react';
import List from './filters/List';
import { createNumberArray, createPriceArray } from './filters/helper';
import Select from './filters/Select';
import Radio from './filters/Radio';
import DateFilter from './filters/DateFilter';
import NumberFilter from './filters/NumberFilter';
import { PortalSiteType } from '../../types';
import { Field as FieldType, FiltersType } from './filters/filter_types';

interface Props {
  PortalSite: PortalSiteType;
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
  let options = [];
  if (field.options) {
    options = field.options;
  } else if (field.max !== undefined) {
    options = field.id === 'weekprice_max'
      ? createPriceArray(field.max)
      : createNumberArray(field.max);
  } else if (['countries', 'cities', 'regions'].includes(field.id)) {
    options = PortalSite[field.id] || [];
  }

  const effectiveType =
    !VALID_TYPES.includes(field.type) &&
    NUMERIC_SELECT_FIELDS.includes(field.id)
      ? 'select'
      : field.type;

  let default_settings = {
    options,
    field,
    filters,
    value
  };

  if (effectiveType === 'select') {
    return <Select {...default_settings} onChange={onFilterChange} />;
  } else if (effectiveType === 'list') {
    return <List {...default_settings} onChange={onFilterChange} />;
  } else if (effectiveType === 'radio') {
    return <Radio {...default_settings} onChange={onFilterChange} />;
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
