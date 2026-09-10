import React from 'react';
import List from './filters/List';
import Select from './filters/Select';
import Radio from './filters/Radio';
import DateFilter from './filters/DateFilter';
import NumberFilter from './filters/NumberFilter';
import type { AppPortalSite } from '../loadPortalSite';
import type { ResolvedOption } from '../../_lib/active_filters';
import { resolveFieldOptions, resolveFieldType } from './filters/helper';
import {
  Field as FieldType,
  FiltersType,
  OptionsType
} from './filters/filter_types';

interface Props {
  PortalSite: AppPortalSite;
  field: FieldType;
  filters: FiltersType;
  value: string;
  onFilterChange: Function;
  /** Pre-resolved options; resolved from the field and portal site when absent. */
  options?: ResolvedOption[];
  /** Id of the visible label; names controls a `<label for>` cannot target (chips, radios). */
  labelId?: string;
}

function Field({
  PortalSite,
  field,
  filters,
  value,
  onFilterChange,
  options,
  labelId
}: Props): JSX.Element {
  const resolved = options ?? resolveFieldOptions(field, PortalSite);
  const effectiveType = resolveFieldType(field);

  if (effectiveType === 'select') {
    return (
      <Select
        options={resolved as OptionsType[]}
        field={field}
        filters={filters}
        value={value}
        onChange={onFilterChange}
      />
    );
  } else if (effectiveType === 'list') {
    return (
      <List
        options={resolved as OptionsType[]}
        field={field}
        filters={filters}
        value={value}
        onChange={onFilterChange}
        labelledBy={labelId}
      />
    );
  } else if (effectiveType === 'radio') {
    return (
      <Radio
        options={resolved as (OptionsType | string)[]}
        field={field}
        filters={filters}
        onChange={onFilterChange}
        labelledBy={labelId}
      />
    );
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
        id={field.id}
        name={field.id}
        type="text"
        defaultValue={value}
        onBlur={(event) => {
          onFilterChange(field.id, event.target.value);
        }}
      />
    );
  }
}

export default Field;
