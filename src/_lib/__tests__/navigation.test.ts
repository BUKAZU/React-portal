import { redirectTo } from '../navigation';

describe('redirectTo', () => {
  it('assigns the url to window.location.href', () => {
    // jsdom only executes hash navigation, so a hash url is the one kind of
    // navigation whose effect can be observed.
    redirectTo('#paid');

    expect(window.location.href).toContain('#paid');
  });
});
