// src/utils/toast.js
import toast from 'react-hot-toast';

const defaultOptions = {
  duration: 5000,
  position: 'top-right',
  style: {
    background: '#333',
    color: '#fff',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    maxWidth: '400px',
  },
};

export const showToast = {
  success: (message) => {
    return toast.success(message, {
      ...defaultOptions,
      icon: '✓',
      style: {
        ...defaultOptions.style,
        background: '#10b981',
        color: '#fff',
      },
    });
  },

  error: (message) => {
    return toast.error(message, {
      ...defaultOptions,
      icon: '✕',
      duration: 6000,
      style: {
        ...defaultOptions.style,
        background: '#ef4444',
        color: '#fff',
      },
    });
  },

  info: (message) => {
    return toast(message, {
      ...defaultOptions,
      icon: 'ℹ️',
      style: {
        ...defaultOptions.style,
        background: '#3b82f6',
        color: '#fff',
      },
    });
  },

  warning: (message) => {
    return toast(message, {
      ...defaultOptions,
      icon: '⚠️',
      style: {
        ...defaultOptions.style,
        background: '#f59e0b',
        color: '#fff',
      },
    });
  },

  loading: (message) => {
    return toast.loading(message, {
      ...defaultOptions,
      style: {
        ...defaultOptions.style,
        background: '#6366f1',
        color: '#fff',
      },
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  },
};

export { toast };