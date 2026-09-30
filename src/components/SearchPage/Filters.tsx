import React, { useState } from 'react';
import Field from './Field';
import ActiveFilters from './ActiveFilters';
import Close from '../icons/Close.svg';
import Sliders from '../icons/Sliders.svg';
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

const PANEL_ID = 'bu-filters-panel';

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

  // On narrow containers the panel is either a block that folds open under an
  // inline button (default) or, with `fixed_mobile`, a bottom sheet opened from
  // a floating pill button that sits over the results.
  const fixedMobile = Boolean(options.filtersForm.fixed_mobile);

  const filterClass =
    (options.filtersForm.show ?? true)
      ? `filters filters-${options.filtersForm.location}`
      : 'filters-hidden';

  const panelClass = [
    filterClass,
    fixedMobile ? 'bu-filters-sheet' : '',
    show ? 'showOnMobile' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const badge =
    active.length > 0 ? (
      <span className="bu-badge">{active.length}</span>
    ) : null;

  return (
    <>
      <button
        type="button"
        className={fixedMobile ? 'bu-filters-fab' : 'filters-button'}
        aria-expanded={show}
        aria-controls={PANEL_ID}
        onClick={() => setShow(!show)}
      >
        {fixedMobile && <Sliders />}
        {t('filters')}
        {badge}
      </button>
      {fixedMobile && show && (
        <div
          className="bu-filters-backdrop"
          data-testid="filters-backdrop"
          onClick={() => setShow(false)}
        />
      )}
      <div
        id={PANEL_ID}
        className={panelClass}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setShow(false);
        }}
      >
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
        {fixedMobile && (
          <button
            type="button"
            className="bu-filters-apply"
            onClick={() => setShow(false)}
          >
            {t('show_results')}
          </button>
        )}
      </div>
    </>
  );
}

export default Filters;
