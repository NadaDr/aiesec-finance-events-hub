// client/src/components/common/Toast.jsx
// Notifications éphémères (toasts) : useToast().success('...') / .error('...')
// Yetsakkrou wa7adhom ba3d chwaya wa9t, w ma ykhabbiwch el page kima Alert.

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

export const ToastProvider = ({ children, duration = 3500 }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      if (!message) return;
      const id = ++nextId.current;
      setToasts((list) => [...list.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss, duration]
  );

  const api = useMemo(
    () => ({
      success: (msg) => show('success', msg),
      error: (msg) => show('error', msg),
      info: (msg) => show('info', msg)
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map(({ id, type, message }) => {
          const Icon = ICONS[type] || Info;
          return (
            <div key={id} className={`toast toast-${type}`} role="status">
              <Icon size={18} className="toast-icon" />
              <span className="toast-message">{message}</span>
              <button
                type="button"
                className="toast-close"
                onClick={() => dismiss(id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast lezem yesta3mel dakhel <ToastProvider>');
  return ctx;
};
