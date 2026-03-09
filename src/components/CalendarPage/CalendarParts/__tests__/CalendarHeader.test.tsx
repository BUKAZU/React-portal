/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { addMonths, subMonths } from 'date-fns';
import CalendarHeader from '../CalendarHeader';
import { CalendarContextDispatch } from '../CalendarContext';

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

describe('CalendarHeader', () => {
    const mockDispatch = jest.fn();
    const currentMonth = new Date(2025, 0, 1); // January 2025
    const numberOfMonths = 2;

    function renderCalendarHeader(changeMonth = jest.fn()) {
        act(() => {
            root.render(
                <CalendarContextDispatch.Provider value={mockDispatch}>
                    <CalendarHeader
                        changeMonth={changeMonth}
                        currentMonth={currentMonth}
                        numberOfMonths={numberOfMonths}
                    />
                </CalendarContextDispatch.Provider>
            );
        });
    }

    beforeEach(() => {
        mockDispatch.mockClear();
    });

    it('should render the header container with correct classes', () => {
        renderCalendarHeader();

        const header = container.querySelector('.calendars-header');
        expect(header).not.toBeNull();
        expect(header?.classList.contains('bu-grid')).toBe(true);
        expect(header?.classList.contains('bu-grid-cols-3')).toBe(true);
    });

    it('should render three navigation buttons', () => {
        renderCalendarHeader();

        const buttons = container.querySelectorAll('[role="button"]');
        expect(buttons).toHaveLength(3);
    });

    it('should call changeMonth with previous months when prev button is clicked', () => {
        const mockChangeMonth = jest.fn();
        renderCalendarHeader(mockChangeMonth);

        const prevButton = container.querySelector('[role="button"]') as HTMLElement;
        act(() => {
            prevButton.click();
        });

        expect(mockChangeMonth).toHaveBeenCalledTimes(1);
        const expectedDate = subMonths(currentMonth, numberOfMonths);
        expect(mockChangeMonth).toHaveBeenCalledWith(expectedDate);
    });

    it('should call changeMonth with next months when next button is clicked', () => {
        const mockChangeMonth = jest.fn();
        renderCalendarHeader(mockChangeMonth);

        const buttons = container.querySelectorAll('[role="button"]') as NodeListOf<HTMLElement>;
        const nextButton = buttons[2];
        act(() => {
            nextButton.click();
        });

        expect(mockChangeMonth).toHaveBeenCalledTimes(1);
        const expectedDate = addMonths(currentMonth, numberOfMonths);
        expect(mockChangeMonth).toHaveBeenCalledWith(expectedDate);
    });

    it('should dispatch reset action when reset button is clicked', () => {
        renderCalendarHeader();

        const buttons = container.querySelectorAll('[role="button"]') as NodeListOf<HTMLElement>;
        const resetButton = buttons[1];
        act(() => {
            resetButton.click();
        });

        expect(mockDispatch).toHaveBeenCalledWith({ type: 'reset' });
    });

    it('should render navigation icons inside the buttons', () => {
        renderCalendarHeader();

        const icons = container.querySelectorAll('.icon');
        expect(icons).toHaveLength(3);
    });
});
