import React from 'react';
import { FormattedMessage } from 'react-intl';
import { HOUSE_COUNT_QUERY } from '../../_lib/SearchQueries';
import Loading from '../icons/loading.svg';
import ReactPaginate from 'react-paginate';
import { useQuery } from '@apollo/client';

interface Props {
  onPageChange: Function;
  variables: object;
  activePage: number;
  limit: number;
}

function Paginator({
  onPageChange,
  variables,
  activePage,
  limit
}: Props): JSX.Element {
  const { loading, error, data } = useQuery(HOUSE_COUNT_QUERY, { variables });

  if (loading) return <Loading />;
  if (error) {
    return <div>Error</div>;
  }

  const results = data.PortalSite.houses;

  const pageCount = Math.ceil(results.length / limit);
  return (
    <div className="bu-grid bu-grid-cols-2 bup-8 bup-x-16 bu-w100 bu-y-center bu-space-between">
      <div>
        {results.length} <FormattedMessage id="results" />
      </div>
      <ReactPaginate
        pageCount={pageCount}
        onPageChange={({ selected }) => {
          onPageChange(selected);
        }}
        forcePage={activePage}
        pageRangeDisplayed={5}
        breakLabel="..."
        className="bu-pagination"
        nextLabel=">"
        previousLabel="<"
      />
    </div>
  );
}

export default Paginator;
