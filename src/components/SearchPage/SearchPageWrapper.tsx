import React from 'react';
import SearchPage from './SearchPage';
import { useQuery } from '@apollo/client';
import { FiltersType } from './filters/filter_types';
import { SEARCH_PAGE_QUERY } from '../../_lib/queries';
import { ApiError } from '../Error';
import Loading from '../icons/loading.svg';

type MyProps = {
  filters?: FiltersType;
  locale: string;
  portalCode: string;
};

export default function SearchPageWrapper({
  portalCode,
  locale,
  filters
}: MyProps) {
  const { loading, error, data } = useQuery(SEARCH_PAGE_QUERY, {
    variables: { id: portalCode }
  });

  if (loading) return <Loading />;
  if (error) return <ApiError errors={{ ...error }} />;

  const PortalSite = data.PortalSite;

  return (
    <SearchPage
      PortalSite={PortalSite}
      options={PortalSite.options}
      filters={filters}
      locale={locale}
    />
  );
}
