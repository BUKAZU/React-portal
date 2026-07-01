import React, { SyntheticEvent } from 'react';
import { Field, FiltersType, OptionsType } from './filter_types';

interface Props {
  options: OptionsType[] | string[];
  field: Field;
  filters: FiltersType;
  value: string;
  onChange: Function;
}

function Select({
  options,
  field,
  filters,
  value,
  onChange
}: Props): JSX.Element {
  const handleChange = (event: SyntheticEvent<any>) => {
    onChange(field.id, event.currentTarget.value);
  };
  const countries = filters.countries;
  const regions = Array.isArray(filters.regions)
    ? filters.regions
    : [filters.regions].filter((e) => String(e).trim());
  if (options && ['countries', 'cities', 'regions'].includes(field.id)) {
    const typedOptions = options as OptionsType[];
    return (
      <select
        name={field.id}
        onBlur={handleChange}
        onChange={handleChange}
        value={value}
      >
        <option value="" />
        {typedOptions.map((opt) => {
          let hidden = false;
          if (['cities', 'regions'].includes(field.id)) {
            if (countries && !countries.includes(opt.country_id)) {
              hidden = true;
            }
            if (field.id === 'cities') {
              if (!regions.length === false && !regions.includes(opt.region)) {
                hidden = true;
              }
            }
          }

          return (
            <option
              key={opt.id}
              value={opt.id}
              id={opt.region}
              disabled={hidden}
              hidden={hidden}
            >
              {opt.name}
            </option>
          );
        })}
      </select>
    );
  } else {
    return (
      <select
        name={field.id}
        onBlur={handleChange}
        onChange={handleChange}
        value={value}
      >
        <option value="" />
        {options.map((opt) =>
          typeof opt === 'object' ? (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ) : (
            <option key={opt} value={opt}>
              {opt}
            </option>
          )
        )}
      </select>
    );
  }
}

export default Select;
