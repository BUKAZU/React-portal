import React from 'react';
import Modal from '../Modal';
import { t } from '../../intl';
import { GraphQLError } from 'graphql';
import { reportError } from '../../_lib/sentry';

type GraphQLErrorSource = {
  graphQLErrors: readonly GraphQLError[];
};

type ApiErrorProps = {
  errors: readonly GraphQLError[] | GraphQLErrorSource;
};

const reportedErrors = new WeakSet<object>();

function getGraphQLErrors(
  errorSource: readonly GraphQLError[] | GraphQLErrorSource
): readonly GraphQLError[] {
  if ('graphQLErrors' in errorSource) {
    return errorSource.graphQLErrors;
  }

  return errorSource;
}

function ApiError(
  errors: ApiErrorProps,
  modal: boolean = false
): JSX.Element {
  const graphQLErrors = getGraphQLErrors(errors.errors);

  if (
    typeof errors.errors === 'object' &&
    errors.errors !== null &&
    !reportedErrors.has(errors.errors)
  ) {
    reportedErrors.add(errors.errors);
    reportError(new Error(graphQLErrors.map((err) => err.message).join('\n')));
  }

  const errorMessage = (
    <div className="bukazu-error-message">
      <h2>
        {t('something_went_wrong_please_try_again')}
      </h2>
      <ul>
        {graphQLErrors.map((err) => (
          <li key={err.message}>{err.message}</li>
        ))}
      </ul>
    </div>
  );
  if (modal == true) {
    return <Modal show={true}>{errorMessage}</Modal>;
  }

  return errorMessage;
}

export default ApiError;
