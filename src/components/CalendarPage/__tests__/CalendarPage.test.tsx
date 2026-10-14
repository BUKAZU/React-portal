import React, { useContext } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import CalendarWrapper from '../CalendarPage';
import { AppContext } from '../../AppContext';
import { CalendarContextDispatch } from '../CalendarParts/CalendarContext';
import { TrackEvent } from '../../../_lib/Tracking';
import { resetTrackOnce } from '../../../_lib/track_once';
import type { AppPortalSite } from '../../loadPortalSite';

jest.mock('../../../_lib/Tracking', () => ({
  ...jest.requireActual('../../../_lib/Tracking'),
  TrackEvent: jest.fn()
}));

function MockDispatchButton({ type }: { type: string }) {
  const dispatch = useContext(CalendarContextDispatch);
  return <button onClick={() => dispatch({ type, persons: 2 })}>{type}</button>;
}

jest.mock('../CalendarParts/GenerateCalendar', () => () => (
  <MockDispatchButton type="start" />
));
jest.mock('../BookingForm', () => () => <MockDispatchButton type="return" />);

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockTrackEvent = TrackEvent as jest.Mock;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function renderHouse(objectCode: string) {
  act(() => {
    root.render(
      <AppContext.Provider
        value={{
          locale: 'nl',
          portalCode: 'TEST',
          objectCode,
          apiUrl: 'https://api.bukazu.com/graphql'
        }}
      >
        <CalendarWrapper portalSite={{} as AppPortalSite} />
      </AppContext.Provider>
    );
  });
}

function click() {
  act(() => {
    container.querySelector('button')!.click();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  resetTrackOnce();
  Object.defineProperty(document, 'referrer', {
    value: 'https://www.google.com/',
    configurable: true
  });
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

describe('CalendarWrapper tracking', () => {
  it('tracks house_view once per house across starting and returning', () => {
    renderHouse('HOUSE1');
    click();
    expect(container.textContent).toBe('return');
    click();
    expect(container.textContent).toBe('start');

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith({
      house_code: 'HOUSE1',
      portal_code: 'TEST',
      locale: 'nl',
      interaction_type: 'house_view',
      interaction_info: { entry: 'external' }
    });
  });

  it('tracks again for another house', () => {
    renderHouse('HOUSE1');
    renderHouse('HOUSE2');

    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
    expect(mockTrackEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({ house_code: 'HOUSE2' })
    );
  });

  it('does not track a house again after viewing another one', () => {
    renderHouse('HOUSE1');
    renderHouse('HOUSE2');
    renderHouse('HOUSE1');

    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
  });
});
