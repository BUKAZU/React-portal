import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
  children: React.ReactNode;
  show?: boolean;
  buttonText?: string | React.ReactNode;
}

function Modal({ children, buttonText, show }: Props) {
  const [visible, setVisible] = useState(show);

  if (!visible) {
    return (
      <a className="info-button" onClick={() => setVisible(true)}>
        {buttonText}
      </a>
    );
  }

  return (
    <div className="bukazu-modal-container">
      <div className="bukazu-modal-container-inner">
        <div
          className="bukazu-modal-escape"
          onClick={() => setVisible(false)}
        ></div>
        <div className="bukazu-modal">
          <div className="bukazu-modal-content">{children}</div>

          <div className="bukazu-modal-footer">
            <a onClick={() => setVisible(false)}>
              <FormattedMessage id="close" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

Modal.defaultProps = {
  show: false
};

export default Modal;
