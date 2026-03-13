import React from 'react';
import Modal from '../Modal';
import { t } from '../../intl';

export interface GqlError {
  message?: string;
  response?: {
    errors?: Array<{ message: string }>;
  };
  graphQLErrors?: Array<{ message: string }>;
}

function ApiError(
  errors: { errors: GqlError },
  modal: boolean = false
): JSX.Element {
  const gqlErrors: Array<{ message: string }> =
    errors.errors.response?.errors ??
    errors.errors.graphQLErrors ??
    (errors.errors.message ? [{ message: errors.errors.message }] : []);

  const errorMessage = (
    <div className="bukazu-error-message">
      <h2>
        {t('something_went_wrong_please_try_again')}
      </h2>
      <ul>
        {gqlErrors.map((err) => (
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
