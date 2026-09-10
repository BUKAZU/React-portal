import React from 'react';
import { Field, FiltersType, OptionsType } from './filter_types';

interface Props {
  field: Field;
  options: OptionsType[];
  filters: FiltersType;
  value: string;
  onChange: Function;
  /** Id of the element naming this group of chips (the field's visible label). */
  labelledBy?: string;
}

/**
 * A `list` filter field rendered as single-select chips: clicking a chip picks
 * it, clicking the picked chip again clears the filter. City and region chips
 * that do not belong to the chosen country are hidden.
 */
export default function List({
  filters,
  field,
  options,
  onChange,
  value,
  labelledBy
}: Props): JSX.Element {
  const countries = filters.countries;
  const dependsOnCountry = ['cities', 'regions'].includes(field.id);

  const pick = (id: string) => {
    onChange(field.id, value === id ? null : id);
  };

  return (
    <div
      className="bu-chips"
      role="group"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : (field.label ?? field.id)}
    >
      {options.map((opt) => {
        const id = String(opt.id);
        const hidden =
          dependsOnCountry && countries
            ? !countries.includes(opt.country_id)
            : false;
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            className={`bu-chip ${hidden ? 'bu-disabled' : ''}`}
            data-value={id}
            aria-pressed={selected}
            disabled={hidden}
            onClick={() => pick(id)}
          >
            {opt.name}
          </button>
        );
      })}
    </div>
  );
}
