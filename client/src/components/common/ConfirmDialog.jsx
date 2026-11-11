// client/src/components/common/ConfirmDialog.jsx
// Boîte de confirmation fi 3oudh window.confirm (b-style mta3 l'application) :
//   const confirm = useConfirm();
//   if (!(await confirm({ title, message, confirmLabel }))) return;

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions(typeof opts === 'string' ? { message: opts } : opts);
      }),
    []
  );

  const close = useCallback((result) => {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
  }, []);

  const handleCancel = useCallback(() => close(false), [close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        isOpen={!!options}
        onClose={handleCancel}
        title={options?.title || 'Are you sure?'}
        maxWidth="440px"
      >
        <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.55 }}>
          {options?.message}
        </p>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            {options?.cancelLabel || 'Cancel'}
          </Button>
          <Button
            type="button"
            variant={options?.variant || 'danger'}
            onClick={() => close(true)}
            autoFocus
          >
            {options?.confirmLabel || 'Delete'}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm lezem yesta3mel dakhel <ConfirmProvider>');
  return ctx;
};
