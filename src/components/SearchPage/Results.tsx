import React, { useContext, useEffect, useMemo, useState } from 'react';
import { t } from '../../intl';
import Loading from '../icons/loading.svg';
import SingleResult from './SingleResult';
import Paginator from './Paginator';

import { ApiError } from '../Error';
import { FiltersType } from './filters/filter_types';
import { AppContext } from '../AppContext';
import { PortalSiteType } from '../../types';
import {
  fetchAccommodations,
  type AccommodationsResponse
} from '../../_lib/accommodations';
import { buildSearchParams } from '../../_lib/search_params';

interface Props {
  filters: FiltersType;
  PortalSite: PortalSiteType;
  limit: number;
  skip: number;
  onPageChange: Function;
  activePage: number;
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
  activePage
}: Props): JSX.Element {
  const { portalCode, apiUrl, locale } = useContext(AppContext);
  const [state, setState] = useState<ResultsState>({ status: 'loading' });

  // Serialized so the effect re-runs on a changed filter value, not on every
  // render of the parent (which rebuilds the filters object).
  const paramsKey = JSON.stringify(buildSearchParams(filters, { limit, skip }));
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

  const Pagination = (
    <Paginator
      totalCount={meta.total_count}
      activePage={activePage}
      limit={limit}
      onPageChange={onPageChange}
    />
  );

  return (
    <div id="results" className={PortalSite.options.filtersForm.mode}>
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
              options: PortalSite.options.filtersForm
            })
          }}
        />
      ))}
      {Pagination}
    </div>
  );
}

export default Results;
