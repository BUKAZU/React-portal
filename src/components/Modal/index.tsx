import React, { useEffect, useRef, useState } from 'react';
import { t } from '../../intl';

interface Props {
  children: React.ReactNode;
  show?: boolean;
  buttonText?: string | React.ReactNode;
  onClose?: () => void;
}

function Modal({ children, buttonText, show = false, onClose }: Props) {
  const [visible, setVisible] = useState(show);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (visible) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  return (
    <>
      {!visible && buttonText && (
        <button type="button" className="info-button" onClick={() => setVisible(true)}>
          {buttonText}
        </button>
      )}
      <dialog ref={dialogRef} className="bukazu-modal" onCancel={handleClose} onClick={handleDialogClick}>
        <div className="bukazu-modal-content">{children}</div>
        <div className="bukazu-modal-footer">
          <button type="button" onClick={handleClose}>{t('close')}</button>
        </div>
      </dialog>
    </>
  );
}

export default Modal;
