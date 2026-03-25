import * as SentryBrowser from '@sentry/browser';
import { initSentry, setSentryContext, reportError, reportMessage } from '../sentry';

jest.mock('@sentry/browser', () => ({
  init: jest.fn(),
  getClient: jest.fn().mockReturnValue(undefined),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn()
}));

describe('sentry helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure getClient returns undefined so initSentry always proceeds
    (SentryBrowser.getClient as jest.Mock).mockReturnValue(undefined);
  });

  describe('initSentry', () => {
    it('calls Sentry.init with the provided DSN when not already initialised', () => {
      initSentry('https://key@sentry.io/123');
      expect(SentryBrowser.init).toHaveBeenCalledWith({
        dsn: 'https://key@sentry.io/123'
      });
    });

    it('does not call Sentry.init when Sentry is already initialised', () => {
      (SentryBrowser.getClient as jest.Mock).mockReturnValue({});
      initSentry('https://key@sentry.io/123');
      expect(SentryBrowser.init).not.toHaveBeenCalled();
    });
  });

  describe('setSentryContext', () => {
    it('sets portal_code tag', () => {
      setSentryContext({ portalCode: 'PORTAL1' });
      expect(SentryBrowser.setTag).toHaveBeenCalledWith('portal_code', 'PORTAL1');
    });

    it('sets object_code tag when objectCode is provided', () => {
      setSentryContext({ portalCode: 'PORTAL1', objectCode: 'OBJ42' });
      expect(SentryBrowser.setTag).toHaveBeenCalledWith('object_code', 'OBJ42');
    });

    it('sets object_code tag to empty string when objectCode is absent', () => {
      setSentryContext({ portalCode: 'PORTAL1' });
      expect(SentryBrowser.setTag).toHaveBeenCalledWith('object_code', '');
    });

    it('sets locale tag when locale is provided', () => {
      setSentryContext({ portalCode: 'PORTAL1', locale: 'nl' });
      expect(SentryBrowser.setTag).toHaveBeenCalledWith('locale', 'nl');
    });

    it('sets the bukazu context object with all fields', () => {
      setSentryContext({ portalCode: 'PORTAL1', objectCode: 'OBJ42', locale: 'en' });
      expect(SentryBrowser.setContext).toHaveBeenCalledWith(
        'bukazu',
        expect.objectContaining({
          portal_code: 'PORTAL1',
          object_code: 'OBJ42',
          locale: 'en'
        })
      );
    });

    it('includes the current URL in the bukazu context', () => {
      // jsdom sets window.location.href to 'about:blank' by default
      setSentryContext({ portalCode: 'PORTAL1' });
      const callArg = (SentryBrowser.setContext as jest.Mock).mock.calls[0][1];
      expect(callArg).toHaveProperty('url');
    });
  });

  describe('reportError', () => {
    it('calls captureException with the provided error', () => {
      const error = new Error('test error');
      reportError(error);
      expect(SentryBrowser.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe('reportMessage', () => {
    it('calls captureMessage with the message and error level', () => {
      reportMessage('something went wrong');
      expect(SentryBrowser.captureMessage).toHaveBeenCalledWith(
        'something went wrong',
        'error'
      );
    });
  });
});
