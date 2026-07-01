import React, { useState } from 'react';
import { t } from '../../intl';

interface Props {
  children: React.ReactNode;
  show?: boolean;
  buttonText?: string | React.ReactNode;
  onClose?: () => void;
}

function Modal({ children, buttonText, show = false, onClose }: Props) {
  const [visible, setVisible] = useState(show);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

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
          onClick={handleClose}
        ></div>
        <div className="bukazu-modal">
          <div className="bukazu-modal-content">{children}</div>

          <div className="bukazu-modal-footer">
            <button type="button" onClick={handleClose}>{t('close')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
