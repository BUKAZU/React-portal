import React from 'react';
import Modal from '../Modal';
import { FormattedMessage } from 'react-intl';
import { ApolloError } from '@apollo/client';

function ApiError(
  errors: { errors: ApolloError },
  modal: boolean = false
): JSX.Element {
  const errorMessage = (
    <div className="bukazu-error-message">
      <h2>
        <FormattedMessage id="something_went_wrong_please_try_again" />
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
