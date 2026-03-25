import React from 'react';
import Modal from '../Modal';
import { t } from '../../intl';
import { ApolloError } from '@apollo/client';
import { reportError } from '../../_lib/sentry';

const reportedErrors = new WeakSet<ApolloError>();

function ApiError(
  errors: { errors: ApolloError },
  modal: boolean = false
): JSX.Element {
  if (!reportedErrors.has(errors.errors)) {
    reportedErrors.add(errors.errors);
    reportError(errors.errors);
  }

  const errorMessage = (
    <div className="bukazu-error-message">
      <h2>
        {t('something_went_wrong_please_try_again')}
      </h2>
      <ul>
        {errors.errors.graphQLErrors.map((err) => (
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
