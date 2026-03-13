import React from 'react';
import { t } from '../../intl';
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
  return (
    <div className="bu-paginator">
      <div>
        {results.length} {t('results')}
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
