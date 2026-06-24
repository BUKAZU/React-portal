import React from 'react';
import List from './filters/List';
import { createNumberArray, createPriceArray } from './filters/helper';
import Select from './filters/Select';
import Categories from './filters/Categories';
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

function Field({
  PortalSite,
  field,
  filters,
  value,
  onFilterChange
}: Props): JSX.Element {
  let options = [];
  if (['countries', 'cities', 'regions'].includes(field.id)) {
    options = PortalSite[field.id];
  } else if (field.id === 'persons_min' || field.id === 'persons_max') {
    options = createNumberArray(PortalSite.max_persons);
  } else if (field.id === 'bedrooms_min') {
    options = createNumberArray(PortalSite.max_bedrooms);
  } else if (field.id === 'bathrooms_min') {
    options = createNumberArray(PortalSite.max_bathrooms);
  } else if (field.id === 'weekprice_max') {
    options = createPriceArray(PortalSite.max_weekprice);
  } else {
    options = createNumberArray(PortalSite[field.id]);
  }

  let default_settings = {
    options,
    field,
    filters,
    value
  };

  if (field.id === 'properties') {
    return (
      <Categories
        PortalSite={PortalSite}
        filters={filters}
        onChange={onFilterChange}
      />
    );
  } else if (field.type === 'select') {
    return <Select {...default_settings} onChange={onFilterChange} />;
  } else if (field.type === 'list') {
    return <List {...default_settings} onChange={onFilterChange} />;
  } else if (field.type === 'radio') {
    return <Radio {...default_settings} onChange={onFilterChange} />;
  } else if (field.type === 'number') {
    return (
      <NumberFilter
        PortalSite={PortalSite}
        field={field}
        value={value}
        onChange={onFilterChange}
      />
    );
  } else if (field.type === 'date') {
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
