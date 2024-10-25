import React, { useState } from 'react';
import Field from './Field';
import Reload from '../icons/Reload.svg';
import { FormattedMessage } from 'react-intl';
import { defaultFilter } from './filters/helper';
import { FiltersType } from './filters/filter_types';
import { PortalOptions, PortalSiteType } from '../../types';

interface Props {
  filters: FiltersType;
  onFilterChange: Function;
  PortalSite: PortalSiteType;
  options: PortalOptions;
}

function Filters({
  filters,
  onFilterChange,
  PortalSite,
  options
}: Props): JSX.Element {
  function saveFilters(field, input) {
    let newFilters: any = filters;
    newFilters[field] = input;
    onFilterChange(newFilters);
  }

  const [show, setShow] = useState(false);

  const searchFields = options.searchFields || defaultFilter;
  let fixed = options.filtersForm
    ? options.filtersForm.fixedMobile
      ? 'fixed-mobile'
      : null
    : null;

  let filterClass = options.filtersForm
    ? options.filtersForm.show
      ? `filters filters-${options.filtersForm.location}`
      : 'hidden'
    : 'filters';

  let showOn = show && 'showOnMobile';

  return (
    <>
      <button
        className={`${fixed} px-3 py-2 text-sm font-medium text-center rounded-md`}
        onClick={() => setShow(!show)}
      >
        <FormattedMessage id="filters" />
      </button>
      <div className={`${filterClass} ${fixed} ${showOn}`}>
        <button
          onClick={() => {
            let filters = {};
            for (var property in filters) {
              filters[property] = '';
            }
            onFilterChange(filters);
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
              {PortalSite[`${field.id}_label`]}
            </label>
            <Field
              field={field}
              PortalSite={PortalSite}
              filters={filters}
              value={filters[field.id]}
              onFilterChange={saveFilters}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default Filters;
