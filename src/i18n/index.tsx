import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { storage } from '../utils/storage';
import { LanguageCode, LanguageOption, SUPPORTED_LANGUAGES, TranslationSchema } from './types';
import { en } from './en';
import { ta } from './ta';
import { te } from './te';
import { ml } from './ml';
import { kn } from './kn';
import { hi } from './hi';

export * from './types';
export * from './contentTranslator';
export * from '../utils/indiaLocation';
export * from './supplierTranslations';
export * from './deliveryTranslations';
export * from './deliveryPartnerTranslations';
export * from './storeReviewsTranslations';
export * from './creditTranslations';

export const translations: Record<LanguageCode, TranslationSchema> = {
  en,
  ta,
  te,
  ml,
  kn,
  hi,
};

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

/**
 * Interpolates variables in format `{{key}}` with corresponding params.
 */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
  });
}

/**
 * Resolves a nested translation key such as "common.save" or "products.showingProductsCount".
 * Falls back to English if the translation is missing, and returns the keyPath if completely absent.
 */
export function translate(
  lang: LanguageCode,
  keyPath: string,
  params?: Record<string, string | number>
): string {
  const parts = keyPath.split('.');
  
  // 1. Try target language
  let val: any = translations[lang];
  for (const part of parts) {
    if (val && typeof val === 'object' && part in val) {
      val = val[part];
    } else {
      val = undefined;
      break;
    }
  }

  // 2. Fall back to English if missing or not string
  if (typeof val !== 'string' && lang !== 'en') {
    let fallbackVal: any = translations.en;
    for (const part of parts) {
      if (fallbackVal && typeof fallbackVal === 'object' && part in fallbackVal) {
        fallbackVal = fallbackVal[part];
      } else {
        fallbackVal = undefined;
        break;
      }
    }
    if (typeof fallbackVal === 'string') {
      val = fallbackVal;
    }
  }

  // 3. If still not a string, return key leaf or full keyPath (never undefined / crash)
  if (typeof val !== 'string') {
    return parts[parts.length - 1] || keyPath;
  }

  return interpolate(val, params);
}

export type TFunction = ((keyPath: string, params?: Record<string, string | number>) => string) & TranslationSchema;

export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: TFunction;
  currentLanguage: LanguageOption;
  supportedLanguages: LanguageOption[];
}

const defaultT = Object.assign(
  (keyPath: string, params?: Record<string, string | number>) => translate(DEFAULT_LANGUAGE, keyPath, params),
  translations[DEFAULT_LANGUAGE]
) as TFunction;

export const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: async () => {},
  t: defaultT,
  currentLanguage: SUPPORTED_LANGUAGES[0],
  supportedLanguages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.getLanguage();
        if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
          setLanguageState(saved as LanguageCode);
        }
      } catch (err) {
        console.warn('Failed to load language from storage', err);
      }
    })();
  }, []);

  const setLanguage = useCallback(async (newLang: LanguageCode) => {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === newLang)) return;
    setLanguageState(newLang);
    try {
      await storage.setLanguage(newLang);
    } catch (err) {
      console.warn('Failed to save language to storage', err);
    }
  }, []);

  const t = useMemo(() => {
    const fn = (keyPath: string, params?: Record<string, string | number>) => {
      return translate(language, keyPath, params);
    };
    return Object.assign(fn, translations[language] || translations.en) as TFunction;
  }, [language]);

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      currentLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t, currentLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const { t, language, setLanguage, currentLanguage, supportedLanguages } = useLanguage();
  return { t, language, setLanguage, currentLanguage, supportedLanguages };
}
