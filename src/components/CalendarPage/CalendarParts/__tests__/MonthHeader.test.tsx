/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import MonthHeader from '../MonthHeader';

// Required for act() to work correctly in the jsdom test environment
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Set locale for FormatIntl
(global as any).window.__localeId__ = 'en';

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

describe('MonthHeader', () => {
    it('should render a bold header container', () => {
        const month = new Date(2025, 0, 1); // January 2025
        act(() => {
            root.render(<MonthHeader month={month} />);
        });

        const header = container.querySelector('.bu-bold');
        expect(header).not.toBeNull();
    });

    it('should render month name and year inside a span', () => {
        const month = new Date(2025, 0, 1); // January 2025
        act(() => {
            root.render(<MonthHeader month={month} />);
        });

        const span = container.querySelector('span');
        expect(span).not.toBeNull();
        expect(span?.textContent).toBeTruthy();
        // Should contain the year
        expect(span?.textContent).toContain('2025');
    });

    it('should render center-aligned column', () => {
        const month = new Date(2025, 5, 1); // June 2025
        act(() => {
            root.render(<MonthHeader month={month} />);
        });

        const col = container.querySelector('.bu-text-center');
        expect(col).not.toBeNull();
    });

    it('should update displayed month when prop changes', () => {
        const janMonth = new Date(2025, 0, 1);
        act(() => {
            root.render(<MonthHeader month={janMonth} />);
        });
        const janText = container.querySelector('span')?.textContent;

        const junMonth = new Date(2025, 5, 1);
        act(() => {
            root.render(<MonthHeader month={junMonth} />);
        });
        const junText = container.querySelector('span')?.textContent;

        expect(janText).not.toBe(junText);
    });
});
