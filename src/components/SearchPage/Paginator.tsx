import React from 'react';
import { t } from '../../intl';
import { HOUSE_COUNT_QUERY } from '../../_lib/SearchQueries';
import Loading from '../icons/loading.svg';
import { useQuery } from '@apollo/client';

interface Props {
  onPageChange: Function;
  variables: object;
  activePage: number;
  limit: number;
}

const PAGE_RANGE = 5;

export function buildPageRange(
  activePage: number,
  pageCount: number
): (number | '...')[] {
  if (pageCount <= PAGE_RANGE + 2) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }

  const half = Math.floor(PAGE_RANGE / 2);
  let start = Math.max(1, activePage - half);
  let end = start + PAGE_RANGE - 1;

  if (end >= pageCount - 1) {
    end = pageCount - 2;
    start = end - PAGE_RANGE + 1;
  }

  const pages: (number | '...')[] = [0];

  if (start > 1) {
    pages.push('...');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < pageCount - 2) {
    pages.push('...');
  }

  pages.push(pageCount - 1);

  return pages;
}

function Paginator({
  onPageChange,
  variables,
  activePage,
  limit
}: Props): JSX.Element {
  const { loading, error, data } = useQuery(HOUSE_COUNT_QUERY, { variables });

  if (loading)
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Loading />
      </div>
    );
  if (error) {
    return <div>Error</div>;
  }

  const results = data.PortalSite.houses;
  const pageCount = Math.ceil(results.length / limit);
  const pages = buildPageRange(activePage, pageCount);

  return (
    <div className="bu-paginator">
      <div>
        {results.length} {t('results')}
      </div>
      {pageCount > 1 && (
        <ul className="bu-pagination">
          <li className={activePage === 0 ? 'disabled' : ''}>
            <button
              disabled={activePage === 0}
              onClick={() => onPageChange(activePage - 1)}
              aria-label={t('previous')}
            >
              {'<'}
            </button>
          </li>
          {pages.map((page, index) =>
            page === '...' ? (
              <li key={`break-${index}`}>
                <span aria-label="More pages">...</span>
              </li>
            ) : (
              <li key={page} className={page === activePage ? 'selected' : ''}>
                <button
                  data-page-button
                  onClick={() => onPageChange(page)}
                  aria-current={page === activePage ? 'page' : undefined}
                >
                  {page + 1}
                </button>
              </li>
            )
          )}
          <li className={activePage === pageCount - 1 ? 'disabled' : ''}>
            <button
              disabled={activePage === pageCount - 1}
              onClick={() => onPageChange(activePage + 1)}
              aria-label={t('next')}
            >
              {'>'}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

export default Paginator;
