/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { startOfMonth } from 'date-fns';
import WeekDays from '../WeekDays';

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

describe('WeekDays', () => {
    it('should render a grid container', () => {
        const month = startOfMonth(new Date(2025, 0, 1));
        act(() => {
            root.render(<WeekDays month={month} />);
        });

        const grid = container.querySelector('.bu-grid');
        expect(grid).not.toBeNull();
    });

    it('should render exactly 7 day columns', () => {
        const month = startOfMonth(new Date(2025, 0, 1));
        act(() => {
            root.render(<WeekDays month={month} />);
        });

        const dayCols = container.querySelectorAll('.bu-calendar-col');
        expect(dayCols).toHaveLength(7);
    });

    it('should render day columns with text content for weekday abbreviations', () => {
        const month = startOfMonth(new Date(2025, 0, 1));
        act(() => {
            root.render(<WeekDays month={month} />);
        });

        const dayCols = container.querySelectorAll('.bu-calendar-col');
        dayCols.forEach((col) => {
            expect(col.textContent?.trim().length).toBeGreaterThan(0);
        });
    });

    it('should apply bu-grid-cols-7 class to the wrapper', () => {
        const month = startOfMonth(new Date(2025, 0, 1));
        act(() => {
            root.render(<WeekDays month={month} />);
        });

        const wrapper = container.querySelector('.bu-grid-cols-7');
        expect(wrapper).not.toBeNull();
    });
});
