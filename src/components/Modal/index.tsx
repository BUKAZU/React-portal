import React, { useState } from 'react';
import { t } from '../../intl';

interface Props {
  children: React.ReactNode;
  show?: boolean;
  buttonText?: string | React.ReactNode;
}

function Modal({ children, buttonText, show = false }: Props) {
  const [visible, setVisible] = useState(show);

  if (!visible) {
    return (
      <button type="button" className="info-button" onClick={() => setVisible(true)}>
        {buttonText}
      </button>
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
            <button type="button" onClick={() => setVisible(false)}>{t('close')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
