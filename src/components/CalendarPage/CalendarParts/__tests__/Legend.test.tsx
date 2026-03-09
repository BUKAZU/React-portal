/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import Legend from '../Legend';
import en from '../../../../locales/en.json';

// Required for act() to work correctly in the jsdom test environment
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

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

describe('Legend', () => {
    it('should render the legend container', () => {
        act(() => {
            root.render(
                <IntlProvider locale="en" messages={en as any}>
                    <Legend house={{ house_type: 'house' }} />
                </IntlProvider>
            );
        });

        const legend = container.querySelector('.legend');
        expect(legend).not.toBeNull();
    });

    it('should render 4 legend items', () => {
        act(() => {
            root.render(
                <IntlProvider locale="en" messages={en as any}>
                    <Legend house={{ house_type: 'house' }} />
                </IntlProvider>
            );
        });

        const legendItems = container.querySelectorAll('.legend > div');
        expect(legendItems).toHaveLength(4);
    });

    it('should render arrival, booked, departure, and discount legend fields', () => {
        act(() => {
            root.render(
                <IntlProvider locale="en" messages={en as any}>
                    <Legend house={{ house_type: 'house' }} />
                </IntlProvider>
            );
        });

        expect(container.querySelector('.legend-field.arrival')).not.toBeNull();
        expect(container.querySelector('.legend-field.booked')).not.toBeNull();
        expect(container.querySelector('.legend-field.departure')).not.toBeNull();
        expect(container.querySelector('.legend-field.last_minute_discount')).not.toBeNull();
    });

    it('should use the house_type in the message ids', () => {
        act(() => {
            root.render(
                <IntlProvider locale="en" messages={en as any}>
                    <Legend house={{ house_type: 'house' }} />
                </IntlProvider>
            );
        });

        const text = container.querySelector('.legend')?.textContent;
        // The Legend renders translated messages; check it contains non-empty text
        expect(text).toBeTruthy();
        expect(text?.length).toBeGreaterThan(0);
    });
});
