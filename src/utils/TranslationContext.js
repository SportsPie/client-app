import React, { useEffect, useState } from 'react';
import en from 'locales/en.json';
import ko from 'locales/ko.json';
import * as RNLocalize from 'react-native-localize';
import { getStorage, setStorage } from './AsyncStorageUtils';

const translations = {
  en,
  ko,
};

export const getTranslation = async () => {
  let lang = await getStorage('lang');
  if (!lang) {
    lang = RNLocalize.getLocales()[0].languageCode;
  }
  return translations[lang];
};

export const TranslationContext = React.createContext();

export function TranslationProvider({ children }) {
  const [currentTranslation, setCurrentTranslation] = useState(en);

  const setLanguage = async language => {
    await setStorage('lang', language);
    setCurrentTranslation(translations[language]);
  };

  const translate = key => {
    return currentTranslation[key] || '';
  };

  const checkLang = async () => {
    const lang = await getStorage('lang');
    if (lang) {
      setLanguage(lang);
    } else {
      const langCode = RNLocalize.getLocales()[0].languageCode;
      await setStorage('lang', langCode);
      setLanguage(langCode);
    }
  };

  useEffect(() => {
    checkLang();
  }, []);

  return (
    <TranslationContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{ translation: currentTranslation, setLanguage, translate }}>
      {children}
    </TranslationContext.Provider>
  );
}
