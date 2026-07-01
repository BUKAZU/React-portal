import React, { SyntheticEvent } from 'react';
import type { AppPortalSite } from '../../loadPortalSite';
import { Field } from './filter_types';

interface Props {
  PortalSite: AppPortalSite;
  field: Field;
  value: string;
  onChange: Function;
}

function NumberFilter({
  PortalSite,
  field,
  value,
  onChange
}: Props): JSX.Element {
  const handleChange = (event: SyntheticEvent<any>) => {
    onChange(field.id, event.currentTarget.value);
  };

  return (
    <input
      value={value}
      type="number"
      min="0"
      max={
        field.id === 'persons_min'
          ? PortalSite.max_persons
          : PortalSite[field.id] as number | undefined
      }
      onBlur={handleChange}
    />
  );
}

export default NumberFilter;
