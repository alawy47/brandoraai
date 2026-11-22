import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';

const I18nContext = createContext(null);
const KEY = 'brandora.lang';

function read() {
  try { return localStorage.getItem(KEY) === 'ar' ? 'ar' : 'en'; } catch { return 'en'; }
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(read);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem(KEY, lang); } catch { /* storage unavailable */ }
  }, [lang]);

  const t = useCallback((path) => {
    const get = (dict) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
    return get(translations[lang]) ?? get(translations.en) ?? path;
  }, [lang]);

  const value = useMemo(() => ({
    lang, dir: lang === 'ar' ? 'rtl' : 'ltr', isRTL: lang === 'ar', setLang, t,
    toggle: () => setLang((l) => (l === 'ar' ? 'en' : 'ar')),
    // Pick a bilingual field from data objects like { en, ar }.
    pick: (obj) => (obj && typeof obj === 'object' ? obj[lang] ?? obj.en : obj),
  }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
