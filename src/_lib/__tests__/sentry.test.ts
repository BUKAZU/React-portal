import * as SentryBrowser from '@sentry/browser';
import { reportError, reportMessage } from '../sentry';

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn()
}));

describe('sentry helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
