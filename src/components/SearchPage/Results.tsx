import React, { useContext, useEffect, useMemo, useState } from 'react';
import { t } from '../../intl';
import Loading from '../icons/loading.svg';
import SingleResult from './SingleResult';
import Paginator from './Paginator';
import ViewToggle from './ViewToggle';

import { ApiError } from '../Error';
import { FiltersType } from './filters/filter_types';
import { AppContext } from '../AppContext';
import { useCurrency } from '../CurrencyContext';
import CurrencySelector from '../CurrencySelector';
import { PortalSiteType } from '../../types';
import {
  fetchAccommodations,
  type AccommodationsResponse
} from '../../_lib/accommodations';
import { buildSearchParams } from '../../_lib/search_params';
import type { ViewMode } from '../../_lib/view_mode';

interface Props {
  filters: FiltersType;
  PortalSite: PortalSiteType;
  limit: number;
  skip: number;
  onPageChange: Function;
  activePage: number;
  /** Results layout; falls back to the portal's configured mode. */
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

type ResultsState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; response: AccommodationsResponse };

function Results({
  filters,
  PortalSite,
  limit,
  skip,
  onPageChange,
  activePage,
  viewMode,
  onViewModeChange
}: Props): JSX.Element {
  const { portalCode, apiUrl, locale } = useContext(AppContext);
  const { currency } = useCurrency();
  const [state, setState] = useState<ResultsState>({ status: 'loading' });

  // Serialized so the effect re-runs on a changed filter value, not on every
  // render of the parent (which rebuilds the filters object).
  const paramsKey = JSON.stringify(
    buildSearchParams(filters, { limit, skip, currency })
  );
  const params = useMemo(
    () => JSON.parse(paramsKey) as Record<string, string>,
    [paramsKey]
  );

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    fetchAccommodations({
      apiUrl,
      locale,
      portalCode,
      params,
      signal: controller.signal
    })
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }
        setState({ status: 'ready', response });
      })
      .catch((error: unknown) => {
        // An aborted request was superseded by a newer one; its result is stale.
        if (controller.signal.aborted) {
          return;
        }
        setState({
          status: 'error',
          error:
            error instanceof Error
              ? error
              : new Error('A search request failed')
        });
      });

    return () => {
      controller.abort();
    };
  }, [apiUrl, locale, portalCode, params]);

  if (state.status === 'loading') {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div>
        <ApiError errors={state.error}></ApiError>
      </div>
    );
  }

  const { items, meta } = state.response;
  const mode = viewMode ?? PortalSite.options.filtersForm.mode;

  const Pagination = (
    <Paginator
      totalCount={meta.total_count}
      activePage={activePage}
      limit={limit}
      onPageChange={onPageChange}
    />
  );

  return (
    <div id="results" className={mode}>
      <div className="bu-results-toolbar">
        <CurrencySelector />
        {onViewModeChange && (
          <ViewToggle mode={mode} onChange={onViewModeChange} />
        )}
      </div>
      {Pagination}
      {items.length === 0 ? (
        <div className="bu-noresults">{t('no_results')}</div>
      ) : null}
      {items.map((result) => (
        <div
          key={result.id}
          style={{ display: 'contents' }}
          dangerouslySetInnerHTML={{
            __html: SingleResult({
              result,
              options: PortalSite.options.filtersForm,
              currency: meta.currency ?? currency
            })
          }}
        />
      ))}
      {Pagination}
    </div>
  );
}

export default Results;
