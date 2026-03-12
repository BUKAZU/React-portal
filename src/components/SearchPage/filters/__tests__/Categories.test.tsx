import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Categories from '../Categories';
import { PortalSiteType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockCategories = [
  {
    id: 1,
    name: 'Amenities',
    properties: [
      { id: 10, name: 'Pool' },
      { id: 11, name: 'WiFi' }
    ]
  },
  {
    id: 2,
    name: 'Views',
    properties: [
      { id: 20, name: 'Sea View' }
    ]
  }
];

const mockPortalSite: PortalSiteType = {
  portal_code: 'TEST',
  max_persons: 10,
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000,
  categories: mockCategories,
  options: {
    filtersForm: {
      categories: [1, 2],
      showCity: false,
      showRegion: false,
      showCountry: false,
      showPersons: false,
      showBathrooms: false,
      showBedrooms: false,
      showPrice: false,
      showRating: false,
      no_results: 20,
      location: 'left',
      mode: 'grid',
      show: true,
      fixedMobile: false
    },
    bookingFields: [],
    bookingForm: {} as any
  },
  name: 'Test Portal'
} as any;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

describe('Categories (filter)', () => {
  it('should render category group sections', () => {
    act(() => {
      root.render(
        <React.Fragment>
          {Categories({
            PortalSite: mockPortalSite,
            filters: {},
            onChange: jest.fn()
          })}
        </React.Fragment>
      );
    });

    const categoryGroups = container.querySelectorAll('.bu-properties');
    expect(categoryGroups.length).toBe(2);
  });

  it('should render category names as headings', () => {
    act(() => {
      root.render(
        <React.Fragment>
          {Categories({
            PortalSite: mockPortalSite,
            filters: {},
            onChange: jest.fn()
          })}
        </React.Fragment>
      );
    });

    const headings = container.querySelectorAll('.bu-properties strong');
    expect(headings[0].textContent).toBe('Amenities');
    expect(headings[1].textContent).toBe('Views');
  });

  it('should render a checkbox for each property', () => {
    act(() => {
      root.render(
        <React.Fragment>
          {Categories({
            PortalSite: mockPortalSite,
            filters: {},
            onChange: jest.fn()
          })}
        </React.Fragment>
      );
    });

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    // Pool + WiFi + Sea View = 3 checkboxes
    expect(checkboxes.length).toBe(3);
  });

  it('should mark a property as checked when it is in filters.properties', () => {
    act(() => {
      root.render(
        <React.Fragment>
          {Categories({
            PortalSite: mockPortalSite,
            filters: { properties: [10] },
            onChange: jest.fn()
          })}
        </React.Fragment>
      );
    });

    const poolCheckbox = container.querySelector('input[value="10"]') as HTMLInputElement;
    expect(poolCheckbox?.checked).toBe(true);

    const wifiCheckbox = container.querySelector('input[value="11"]') as HTMLInputElement;
    expect(wifiCheckbox?.checked).toBe(false);
  });

  it('should call onChange when a property checkbox is toggled', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <React.Fragment>
          {Categories({
            PortalSite: mockPortalSite,
            filters: { properties: [] },
            onChange
          })}
        </React.Fragment>
      );
    });

    const poolCheckbox = container.querySelector('input[value="10"]') as HTMLInputElement;
    act(() => {
      poolCheckbox.click();
    });

    expect(onChange).toHaveBeenCalledWith('properties', expect.any(Array));
  });

  it('should only render categories that are in requiredCategories', () => {
    const restrictedPortalSite: PortalSiteType = {
      ...mockPortalSite,
      options: {
        ...mockPortalSite.options,
        filtersForm: {
          ...mockPortalSite.options.filtersForm,
          categories: [1] // only Amenities
        }
      }
    } as any;

    act(() => {
      root.render(
        <React.Fragment>
          {Categories({
            PortalSite: restrictedPortalSite,
            filters: {},
            onChange: jest.fn()
          })}
        </React.Fragment>
      );
    });

    const categoryGroups = container.querySelectorAll('.bu-properties');
    expect(categoryGroups.length).toBe(1);
  });
});
