import React, { useState } from 'react';
import Field from './Field';
import ActiveFilters from './ActiveFilters';
import Close from '../icons/Close.svg';
import { t } from '../../intl';
import { FiltersType } from './filters/filter_types';
import { PortalOptions } from '../../types';
import type { AppPortalSite } from '../loadPortalSite';
import {
  activeFilters,
  hasFilterValue,
  removeFilter,
  type ResolvedField
} from '../../_lib/active_filters';
import { resolveFieldOptions } from './filters/helper';

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
  const [show, setShow] = useState(false);

  const searchFields = options.searchFields ?? [];
  const resolved: ResolvedField[] = searchFields.map((field) => ({
    ...field,
    options: resolveFieldOptions(field, PortalSite)
  }));
  const optionsById = new Map(resolved.map((f) => [f.id, f.options]));
  const active = activeFilters(filters, resolved);
  const values = filters as Record<string, unknown>;
  // A chosen filter lives in the pills above; its control leaves the list.
  const openFields = searchFields.filter(
    (field) => !hasFilterValue(values[field.id])
  );

  function saveFilters(key: string, input: unknown) {
    if (hasFilterValue(input)) {
      onFilterChange({ ...filters, [key]: input });
    } else {
      onFilterChange(removeFilter(filters, key));
    }
  }

  const fixed = options.filtersForm.fixed_mobile ? 'fixed-mobile' : '';

  const filterClass =
    (options.filtersForm.show ?? true)
      ? `filters filters-${options.filtersForm.location}`
      : 'filters-hidden';

  const showOn = show ? 'showOnMobile' : '';

  return (
    <>
      <button
        type="button"
        className={`filters-button ${fixed}`}
        aria-expanded={show}
        onClick={() => setShow(!show)}
      >
        {t('filters')}
        {active.length > 0 && <span className="bu-badge">{active.length}</span>}
      </button>
      <div className={`${filterClass} ${fixed} ${showOn}`}>
        <div className="filters-header">
          <span className="filters-title">{t('filters')}</span>
          <button
            type="button"
            className="filters-close"
            aria-label={t('close')}
            onClick={() => setShow(false)}
          >
            <Close size={18} />
          </button>
        </div>
        <ActiveFilters
          items={active}
          onRemove={(key) => onFilterChange(removeFilter(filters, key))}
          onClear={() => onFilterChange({})}
        />
        {openFields.map((field) => (
          <div key={field.id} className="bu-field" id={`field-${field.id}`}>
            <label htmlFor={field.id}>{field.label}</label>
            <Field
              field={field}
              options={optionsById.get(field.id)}
              PortalSite={PortalSite}
              filters={filters}
              value={String(values[field.id] ?? '')}
              onFilterChange={saveFilters}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default Filters;
