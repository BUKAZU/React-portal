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
  type ResolvedField
} from '../../_lib/active_filters';
import { applyFilterChange } from '../../_lib/location_filters';
import { isLabelableField, resolveFieldOptions } from './filters/helper';

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

  // Setting or clearing a filter also keeps country > region > city consistent.
  function saveFilters(key: string, input: unknown) {
    onFilterChange(applyFilterChange(filters, key, input, optionsById));
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
          onRemove={(key) => saveFilters(key, null)}
          onClear={() => onFilterChange({})}
        />
        {openFields.map((field) => (
          <div key={field.id} className="bu-field" id={`field-${field.id}`}>
            {/* Chips and radios have no single control to point `for` at; they
                name their group with aria-labelledby instead. */}
            <label
              id={`${field.id}-label`}
              htmlFor={isLabelableField(field) ? field.id : undefined}
            >
              {field.label}
            </label>
            <Field
              field={field}
              labelId={`${field.id}-label`}
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
