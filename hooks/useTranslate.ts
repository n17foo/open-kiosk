import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Wrapper around react-i18next's useTranslation with a namespace prefix.
 * Usage: const { t } = useTranslate('basket');
 *        t('title') → looks up 'basket.title'
 */
export function useTranslate(namespace?: string) {
  const { t: rawT, i18n } = useTranslation();

  const t = useCallback(
    (key: string, options?: Record<string, unknown>): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return String(rawT(fullKey, options as never));
    },
    [rawT, namespace]
  );

  const changeLanguage = useCallback(
    async (lng: string) => {
      await i18n.changeLanguage(lng);
    },
    [i18n]
  );

  return {
    t,
    changeLanguage,
    currentLanguage: i18n.language,
    i18n,
  };
}
