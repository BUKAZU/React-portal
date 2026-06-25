import React from 'react';
import { Field, FiltersType, OptionsType } from './filter_types';

interface Props {
  field: Field;
  options: OptionsType[];
  filters: FiltersType;
  value: string;
  onChange: Function;
}

export default function List({
  filters,
  field,
  options,
  onChange,
  value
}: Props): JSX.Element {
  const countries = filters.countries;

  const updateList = (e: { target: { value: string } }) => {
    if (value === e.target.value) {
      handleChange(null);
    } else {
      handleChange(e.target.value);
    }
  };

  const handleChange = (value: string) => {
    onChange(field.id, value);
  };

  if (['cities', 'regions'].includes(field.id)) {
    return (
      <ul className="radioList">
        {options.map((opt) => (
          <li
            key={opt.id}
            className={`bu-list-item ${
              countries && !countries.includes(opt.country_id)
                ? 'bu-disabled'
                : 'bu-open'
            }`}
          >
            <input
              name={field.id}
              type="checkbox"
              id={opt.id}
              value={opt.id}
              disabled={countries ? !countries.includes(opt.country_id) : false}
              checked={value === opt.id}
              onBlur={handleChange}
              onChange={handleChange}
            />
            <label htmlFor={opt.id}>{opt.name}</label>
          </li>
        ))}
      </ul>
    );
  } else {
    return (
      <ul className="radioList">
        {options.map((opt) => (
          <li key={opt.id} className={`bu-list-item bu-open`}>
            <input
              name={field.id}
              type="checkbox"
              id={String(opt.id)}
              value={opt.id}
              checked={value === String(opt.id)}
              onBlur={handleChange}
              onChange={updateList}
            />
            <label htmlFor={String(opt.id)}>{opt.name}</label>
          </li>
        ))}
      </ul>
    );
  }
}
