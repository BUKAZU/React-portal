import React from 'react';
import { t } from '../../intl';
import Grid from '../icons/Grid.svg';
import ViewList from '../icons/ViewList.svg';
import type { ViewMode } from '../../_lib/view_mode';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

/** Segmented grid / list switch for the results layout. */
function ViewToggle({ mode, onChange }: Props): JSX.Element {
  return (
    <div className="bu-view-toggle" role="group" aria-label={t('view_mode')}>
      <button
        type="button"
        aria-pressed={mode === 'grid'}
        aria-label={t('grid_view')}
        onClick={() => onChange('grid')}
      >
        <Grid />
      </button>
      <button
        type="button"
        aria-pressed={mode === 'list'}
        aria-label={t('list_view')}
        onClick={() => onChange('list')}
      >
        <ViewList />
      </button>
    </div>
  );
}

export default ViewToggle;
