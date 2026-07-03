import React, { useState } from 'react';
import Field from './Field';
import Reload from '../icons/Reload.svg';
import { t } from '../../intl';
import { FiltersType } from './filters/filter_types';
import { PortalOptions } from '../../types';
import type { AppPortalSite } from '../loadPortalSite';

interface Props {
  filters: FiltersType;
  onFilterChange: Function;
  PortalSite: AppPortalSite;
  options: PortalOptions;
}

function Filters({
  filters,
  onFilterChange,
  PortalSite,
  options
}: Props): JSX.Element {
  function saveFilters(field: string, input: unknown) {
    const newFilters: Record<string, unknown> = { ...filters };
    newFilters[field] = input;
    onFilterChange(newFilters);
  }

  const [show, setShow] = useState(false);

  const searchFields = options.searchFields ?? [];

  let fixed = options.filtersForm.fixed_mobile ? 'fixed-mobile' : null;

  let filterClass =
    (options.filtersForm.show ?? true)
      ? `filters filters-${options.filtersForm.location}`
      : 'filters-hidden';

  let showOn = show && 'showOnMobile';

  return (
    <>
      <button
        className={`filters-button ${fixed}`}
        onClick={() => setShow(!show)}
      >
        {t('filters')}
      </button>
      <div className={`${filterClass} ${fixed} ${showOn}`}>
        <button
          onClick={() => {
            onFilterChange({});
          }}
          className="filters-reload"
        >
          <Reload />
        </button>
        {searchFields.map((field) => (
          <div key={field.id} className="bu-field" id={field.id}>
            <label
              style={{
                width: '100%',
                display: 'block'
              }}
              htmlFor={field.id}
            >
              {field.label}
            </label>
            <Field
              field={field}
              PortalSite={PortalSite}
              filters={filters}
              value={(filters as Record<string, string>)[field.id] ?? ''}
              onFilterChange={saveFilters}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default Filters;
