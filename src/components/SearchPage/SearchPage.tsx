import React, { Component } from 'react';
import Filters from './Filters';
import Results from './Results';
import { PortalOptions, PortalSiteType } from '../../types';
import { FiltersType } from './filters/filter_types';
import { TrackEvent } from '../../_lib/Tracking';

type MyProps = {
  options: PortalOptions;
  filters?: FiltersType;
  PortalSite: PortalSiteType;
  locale: string;
};

type MyState = {
  filters: FiltersType;
  activePage: number;
  limit: number;
  skip: number;
};

class SearchPage extends Component<MyProps, MyState> {
  constructor(props: MyProps) {
    super(props);
    let limit = this.props.options.filtersForm
      ? Number(this.props.options.filtersForm.no_results)
      : 20;
    this.state = {
      filters: this.props.filters || {},
      activePage: 1,
      limit,
      skip: 0
    };
    this.onFilterChange = this.onFilterChange.bind(this);
    this.pageChange = this.pageChange.bind(this);
  }

  componentDidMount() {
    let filters = localStorage.getItem('bukazuFilters');
    let activePage = localStorage.getItem('bukazuActivePage');

    if (filters) {
      this.setState({
        filters: JSON.parse(filters)
      });
    }
    if (activePage) {
      this.pageChange(parseInt(activePage) || 0);
    }
  }

  onFilterChange(data: FiltersType) {
    let filters = data;
    this.setState({
      filters
    });

    localStorage.setItem('bukazuFilters', JSON.stringify(filters));
    this.pageChange(0);
  }

  pageChange(pageNumber: number) {
    const { limit } = this.state;
    let newSkip = pageNumber * limit;

    localStorage.setItem('bukazuActivePage', pageNumber.toString());
    this.setState({
      activePage: pageNumber,
      skip: newSkip
    });
  }

  render() {
    const { filters, activePage, limit, skip } = this.state;
    const { options, PortalSite, locale } = this.props;

    TrackEvent({
      portal_code: PortalSite.portal_code,
      interaction_type: 'search_view',
      locale: locale
    });

    return (
      <div
        id="search-page"
        className={
          options.filtersForm
            ? options.filtersForm.location === 'right'
              ? 'bu-reverse'
              : options.filtersForm.location === 'top'
              ? 'bu-column'
              : ''
            : ''
        }
      >
        <Filters
          PortalSite={PortalSite}
          filters={filters}
          onFilterChange={this.onFilterChange}
          options={options}
        />
        <Results
          PortalSite={PortalSite}
          filters={filters}
          activePage={activePage}
          onPageChange={this.pageChange}
          skip={skip}
          limit={limit}
        />
      </div>
    );
  }
}

export default SearchPage;
