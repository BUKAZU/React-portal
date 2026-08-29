import React from 'react';
import { t } from '../../intl';

/** An error carrying several messages to display, such as CreateBookingError. */
type ErrorWithMessages = Error & { messages: readonly string[] };

type ApiErrorSource = ErrorWithMessages | Error;

type ApiErrorProps = {
  errors: ApiErrorSource;
};

function hasMessages(source: ApiErrorSource): source is ErrorWithMessages {
  return (
    'messages' in source &&
    Array.isArray((source as ErrorWithMessages).messages) &&
    (source as ErrorWithMessages).messages.every(
      (m) => typeof m === 'string'
    )
  );
}

/** Collect the messages to render: the REST clients either carry a list of
 * messages (CreateBookingError) or a single one. */
function getErrorMessages(source: ApiErrorSource): readonly string[] {
  if (hasMessages(source)) {
    return source.messages;
  }
  return [source.message];
}

function ApiError(errors: ApiErrorProps): JSX.Element {
  const messages = getErrorMessages(errors.errors);

  return (
    <div className="bukazu-error-message">
      <h2>{t('something_went_wrong_please_try_again')}</h2>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export default ApiError;
