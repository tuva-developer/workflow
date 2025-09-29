import { toast, ToastOptions } from 'react-toastify';
import { getTheme } from '@/global/appState';

const getToastOptions = (): ToastOptions => {
  const currentTheme = getTheme();

  const baseStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    borderRadius: '8px',
    boxShadow: 'none',
  };

  const lightStyle: React.CSSProperties = {
    ...baseStyle,
    background: '#F9F9F9',
    color: '#242424',
    border: '1px solid #E1E5EA',
  };

  const darkStyle: React.CSSProperties = {
    ...baseStyle,
    background: '#181818',
    color: '#F9FAFB',
    border: '1px solid #393E46',
  };

  return {
    style: currentTheme === 'dark' ? darkStyle : lightStyle,
    autoClose: 1000,
    position: 'top-right',
  };
};

export const showSuccess = (message: string): void => {
  toast.success(message, {
    ...getToastOptions(),
  });
};

export const showError = (message: string): void => {
  toast.error(message, {
    ...getToastOptions(),
  });
};

export const showInfo = (message: string): void => {
  toast.info(message, {
    ...getToastOptions(),
  });
};

export const showWarn = (message: string): void => {
  toast.warn(message, {
    ...getToastOptions(),
  });
};