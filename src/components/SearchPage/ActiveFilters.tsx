import React from 'react';
import { t } from '../../intl';
import Close from '../icons/Close.svg';
import type { ActiveFilter } from '../../_lib/active_filters';

interface Props {
  items: ActiveFilter[];
  onRemove: (key: string) => void;
  onClear: () => void;
}

/**
 * The filters the visitor has set, as removable pills at the top of the filter
 * panel. Renders nothing when no filter is active.
 */
function ActiveFilters({
  items,
  onRemove,
  onClear
}: Props): JSX.Element | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bu-active-filters">
      <div className="bu-active-filters-header">
        <span>{t('active_filters', { count: items.length })}</span>
        <button type="button" className="bu-link-button" onClick={onClear}>
          {t('clear_all')}
        </button>
      </div>
      <div className="bu-pills">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className="bu-pill"
            data-filter-key={item.key}
            aria-label={t('remove_filter', { filter: item.text })}
            onClick={() => onRemove(item.key)}
          >
            <span>{item.text}</span>
            <span className="bu-pill-remove">
              <Close />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ActiveFilters;
