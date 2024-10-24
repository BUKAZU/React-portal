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
    <div className="navigation">
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
        className="inline-flex -space-x-px text-sm"
        pageLinkClassName="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
        activeLinkClassName="text-blue-600 bg-blue-50"
        previousLinkClassName="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
        nextLinkClassName="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700"
        nextLabel=">"
        previousLabel="<"
      />
    </div>
  );
}

export default Paginator;
