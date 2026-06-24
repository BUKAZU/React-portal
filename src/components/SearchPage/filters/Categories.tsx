import React, { SyntheticEvent } from 'react';
import { PortalSiteType } from '../../../types';
import { Field, FiltersType } from './filter_types';

interface Props {
  PortalSite: PortalSiteType;
  field: Field;
  filters: FiltersType;
  onChange: Function;
}

function Categories({ PortalSite, field, filters, onChange }: Props): JSX.Element {
  const selected = filters.properties || [];
  const category = PortalSite.categories.find((c) => String(c.id) === field.id);

  const handleChange = (event: SyntheticEvent<any>) => {
    const value = Number(event.currentTarget.value);
    const updated = selected.includes(value)
      ? selected.filter((p) => p !== value)
      : [...selected, value];
    onChange('properties', updated);
  };

  if (!category) return <></>;

  return (
    <ul>
      {category.properties.map((property) => (
        <li key={property.id}>
          <label htmlFor={property.id.toString()}>
            <input
              type="checkbox"
              id={property.id.toString()}
              value={property.id}
              checked={selected.includes(property.id)}
              onChange={handleChange}
            />
            {property.name}
          </label>
        </li>
      ))}
    </ul>
  );
}

export default Categories;
