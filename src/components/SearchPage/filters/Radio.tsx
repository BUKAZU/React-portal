import React, { SyntheticEvent } from 'react';
import { Field, FiltersType, OptionsType } from './filter_types';

interface Props {
  options: (OptionsType | string)[];
  filters: FiltersType;
  onChange: Function;
  field: Field;
  /** Id of the element naming this group of radios (the field's visible label). */
  labelledBy?: string;
}

function Radio({
  options,
  filters,
  onChange,
  field,
  labelledBy
}: Props): JSX.Element {
  const countries = filters.countries;

  const handleChange = (event: SyntheticEvent<any>) => {
    onChange(field.id, event.currentTarget.value);
  };

  return (
    <ul
      className="radioList"
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : (field.label ?? field.id)}
    >
      {options.map((opt) => {
        const id = typeof opt === 'string' ? opt : opt.id;
        const name = typeof opt === 'string' ? opt : opt.name;
        const countryId = typeof opt === 'string' ? undefined : opt.country_id;
        const isDisabled =
          countries && countryId ? !countries.includes(countryId) : false;
        return (
          <li
            key={id}
            className={`bu-list-item ${isDisabled ? 'bu-disabled' : ''}`}
          >
            <input
              name={field.id}
              type="radio"
              id={id}
              value={id}
              disabled={isDisabled}
              onBlur={handleChange}
              onChange={handleChange}
            />
            <label htmlFor={id}>{name}</label>
          </li>
        );
      })}
    </ul>
  );
}

export default Radio;
