import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import { searchInfo } from '../../_lib/search_tracking';
import { TrackEvent } from '../../_lib/Tracking';

const SEARCH_TRACKING_DELAY = 1000;

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
  const filtersKey = JSON.stringify(filters);
  const latestFilters = useRef(filters);
  latestFilters.current = filters;
  const trackedFilters = useRef<string | null>(null);
  // Filters that settled for a second and wait for their result count; the
  // count is null while a request is in flight.
  const settledFilters = useRef<string | null>(null);
  const resultCount = useRef<number | null>(null);

  const trackSettledSearch = () => {
    const key = settledFilters.current;
    if (key === null || resultCount.current === null) return;
    settledFilters.current = null;
    trackedFilters.current = key;
    TrackEvent({
      portal_code: portalCode,
      locale,
      interaction_type: 'search',
      interaction_info: searchInfo(latestFilters.current, resultCount.current)
    });
  };

  // Keyed on the filters alone: paging or switching currency is the same
  // search and must not restart or cancel the debounce.
  useEffect(() => {
    if (trackedFilters.current === filtersKey) return;
    const timer = setTimeout(() => {
      settledFilters.current = filtersKey;
      trackSettledSearch();
    }, SEARCH_TRACKING_DELAY);
    return () => {
      clearTimeout(timer);
      settledFilters.current = null;
    };
  }, [filtersKey, portalCode, locale]);

  useEffect(() => {
    const controller = new AbortController();
    resultCount.current = null;
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
        resultCount.current = response.meta.total_count;
        trackSettledSearch();
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
