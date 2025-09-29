import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const usePageTitle = (title: string) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${t(title)}`;

    return () => {
      document.title = previousTitle;
    };
  }, [title, t, i18n.language]);
};

export default usePageTitle; 