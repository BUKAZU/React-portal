import React from 'react';
import { t } from '../../intl';
import type { GraphQLError } from 'graphql';
import { ApolloError } from '@apollo/client';
import { reportError } from '../../_lib/sentry';

type ErrorWithMessage = { message: string };

type GraphQLErrorSource = {
  graphQLErrors: readonly ErrorWithMessage[];
};

/** An error carrying several messages to display, such as CreateBookingError. */
type ErrorWithMessages = Error & { messages: readonly string[] };

type ApiErrorSource =
  | ApolloError
  | readonly GraphQLError[]
  | GraphQLErrorSource
  | ErrorWithMessages
  | Error;

type ApiErrorProps = {
  errors: ApiErrorSource;
};

const reportedErrors = new WeakSet<object>();

function hasMessages(source: ApiErrorSource): source is ErrorWithMessages {
  return (
    'messages' in source &&
    Array.isArray((source as ErrorWithMessages).messages)
  );
}

/** Collect the messages to render, regardless of which API the error came from. */
function getErrorMessages(source: ApiErrorSource): readonly string[] {
  if (Array.isArray(source)) {
    return (source as readonly GraphQLError[]).map((err) => err.message);
  }
  if ('graphQLErrors' in source) {
    return source.graphQLErrors.map((err) => err.message);
  }
  if (hasMessages(source)) {
    return source.messages;
  }
  if (source instanceof Error) {
    return [source.message];
  }
  return [];
}

function ApiError(errors: ApiErrorProps): JSX.Element {
  const messages = getErrorMessages(errors.errors);

  if (
    typeof errors.errors === 'object' &&
    errors.errors !== null &&
    !reportedErrors.has(errors.errors)
  ) {
    reportedErrors.add(errors.errors);
    reportError(new Error(messages.join('\n')));
  }

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
