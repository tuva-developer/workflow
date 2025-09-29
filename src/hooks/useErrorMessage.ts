import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { extractErrorMessage } from '@/utils/errors';

export function useErrorMessage() {
  const { t } = useTranslation();
  return React.useCallback((err: unknown) => {
    const { message } = extractErrorMessage(err);
    return message === 'Something went wrong' ? t('Something went wrong') : t(message);
  }, [t]);
}