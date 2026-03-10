import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import SingleResult from '../SingleResult';
import en from '../../../locales/en.json';
import { HouseType, FiltersFormType } from '../../../types';

// Mock SVG icon
jest.mock('../../icons/ArrowRight.svg', () => () => <svg data-testid="arrow-right" />);

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockResult: HouseType = {
  id: 1,
  code: 'HOUSE1',
  name: 'Test House',
  image_url: 'https://example.com/image.jpg',
  house_url: 'https://example.com/house',
  house_type: 'house',
  persons: 6,
  bedrooms: 3,
  bathrooms: 2,
  minimum_week_price: 1000,
  max_nights: 14,
  city: 'Amsterdam',
  province: 'Noord-Holland',
  country_name: 'Netherlands',
  description: '<p>A nice house</p>',
  rating: 4.5,
  babies_extra: 0,
  allow_option: false,
  cancel_insurance: false
};

const mockOptions: FiltersFormType = {
  showCity: true,
  showRegion: true,
  showCountry: true,
  showPersons: true,
  showBedrooms: true,
  showBathrooms: true,
  showPrice: true,
  showRating: true,
  categories: [],
  no_results: 20,
  location: 'left',
  mode: 'grid',
  show: true,
  fixedMobile: false
} as any;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderSingleResult(
  result: HouseType = mockResult,
  options: FiltersFormType = mockOptions
) {
  act(() => {
    root.render(
      <IntlProvider locale="en" messages={en as any}>
        <SingleResult result={result} options={options} />
      </IntlProvider>
    );
  });
}

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

describe('SingleResult', () => {
  it('should render the result as an anchor tag with the house_url', () => {
    renderSingleResult();

    const link = container.querySelector('a.bukazu-result');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe(mockResult.house_url);
  });

  it('should display the house name', () => {
    renderSingleResult();

    const title = container.querySelector('.result-title');
    expect(title?.textContent).toBe(mockResult.name);
  });

  it('should display the house image', () => {
    renderSingleResult();

    const img = container.querySelector('.image-holder img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(mockResult.image_url);
    expect(img?.getAttribute('alt')).toBe(mockResult.name);
  });

  it('should display city when showCity is true', () => {
    renderSingleResult();

    const place = container.querySelector('.result-place');
    expect(place?.textContent).toContain(mockResult.city);
  });

  it('should not display city when showCity is false', () => {
    renderSingleResult(mockResult, { ...mockOptions, showCity: false });

    const place = container.querySelector('.result-place');
    expect(place?.textContent).not.toContain(mockResult.city);
  });

  it('should display region when showRegion is true', () => {
    renderSingleResult();

    const place = container.querySelector('.result-place');
    expect(place?.textContent).toContain(mockResult.province);
  });

  it('should display country name when showCountry is true', () => {
    renderSingleResult();

    const place = container.querySelector('.result-place');
    expect(place?.textContent).toContain(mockResult.country_name);
  });

  it('should display persons count when showPersons is true', () => {
    renderSingleResult();

    const details = container.querySelector('.result-details');
    expect(details?.textContent).toContain(String(mockResult.persons));
  });

  it('should display bedrooms count when showBedrooms is true', () => {
    renderSingleResult();

    const details = container.querySelector('.result-details');
    expect(details?.textContent).toContain(String(mockResult.bedrooms));
  });

  it('should display bathrooms count when showBathrooms is true', () => {
    renderSingleResult();

    const details = container.querySelector('.result-details');
    expect(details?.textContent).toContain(String(mockResult.bathrooms));
  });

  it('should display rating when showRating is true and rating exists', () => {
    renderSingleResult();

    const rating = container.querySelector('.result-rating');
    expect(rating).not.toBeNull();
    expect(rating?.textContent).toBe(mockResult.rating!.toFixed(1));
  });

  it('should not display rating when rating is not present', () => {
    const resultNoRating = { ...mockResult, rating: undefined };
    renderSingleResult(resultNoRating);

    const rating = container.querySelector('.result-rating');
    expect(rating).toBeNull();
  });

  it('should display minimum_week_price when no booking_price', () => {
    renderSingleResult();

    const price = container.querySelector('.result-price');
    expect(price).not.toBeNull();
    expect(price?.textContent).toContain('1,000');
  });

  it('should display booking_price when available', () => {
    const resultWithBookingPrice = {
      ...mockResult,
      booking_price: { total_price: 750 }
    };
    renderSingleResult(resultWithBookingPrice);

    const price = container.querySelector('.result-price');
    expect(price?.textContent).toContain('750');
  });

  it('should render view_details button text', () => {
    renderSingleResult();

    const button = container.querySelector('.result-button');
    expect(button?.textContent).toBeTruthy();
  });

  it('should handle null options gracefully', () => {
    act(() => {
      root.render(
        <IntlProvider locale="en" messages={en as any}>
          <SingleResult result={mockResult} options={null as any} />
        </IntlProvider>
      );
    });

    // Should render without crashing, just not show optional fields
    expect(container.querySelector('.bukazu-result')).not.toBeNull();
  });
});
