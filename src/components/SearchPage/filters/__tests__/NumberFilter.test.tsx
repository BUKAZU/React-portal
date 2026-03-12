import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import NumberFilter from '../NumberFilter';
import { PortalSiteType } from '../../../../types';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockPortalSite: PortalSiteType = {
  portal_code: 'TEST',
  max_persons: 10,
  max_bedrooms: 5,
  max_bathrooms: 3,
  max_weekprice: 5000,
  categories: [],
  options: {} as any,
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

describe('NumberFilter', () => {
  it('should render a number input', () => {
    act(() => {
      root.render(
        <NumberFilter
          PortalSite={mockPortalSite}
          field={{ id: 'persons_min', type: 'number' }}
          value="2"
          onChange={jest.fn()}
        />
      );
    });

    const input = container.querySelector('input[type="number"]');
    expect(input).not.toBeNull();
  });

  it('should set the value on the input', () => {
    act(() => {
      root.render(
        <NumberFilter
          PortalSite={mockPortalSite}
          field={{ id: 'persons_min', type: 'number' }}
          value="4"
          onChange={jest.fn()}
        />
      );
    });

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input?.value).toBe('4');
  });

  it('should set max to max_persons for persons_min field', () => {
    act(() => {
      root.render(
        <NumberFilter
          PortalSite={mockPortalSite}
          field={{ id: 'persons_min', type: 'number' }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input?.max).toBe(String(mockPortalSite.max_persons));
  });

  it('should set max to the portal site field value for non-persons field', () => {
    act(() => {
      root.render(
        <NumberFilter
          PortalSite={mockPortalSite}
          field={{ id: 'max_bedrooms', type: 'number' }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input?.max).toBe(String(mockPortalSite.max_bedrooms));
  });

  it('should call onChange when the input loses focus', () => {
    const onChange = jest.fn();
    act(() => {
      root.render(
        <NumberFilter
          PortalSite={mockPortalSite}
          field={{ id: 'persons_min', type: 'number' }}
          value=""
          onChange={onChange}
        />
      );
    });

    const input = container.querySelector('input') as HTMLInputElement;
    act(() => {
      input.focus();
      input.blur();
    });

    expect(onChange).toHaveBeenCalled();
  });

  it('should have min set to 0', () => {
    act(() => {
      root.render(
        <NumberFilter
          PortalSite={mockPortalSite}
          field={{ id: 'persons_min', type: 'number' }}
          value=""
          onChange={jest.fn()}
        />
      );
    });

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input?.min).toBe('0');
  });
});
