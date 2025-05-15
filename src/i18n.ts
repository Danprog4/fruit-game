import i18next from "i18next";
import { useTranslation } from "react-i18next";

export const translations = {
  en: {
    "Start game": "Start Game",
  },
  ru: {
    "Start game": "Начать игру",
  },
} as const;

export const supportedLocales = ["en", "ru"];
export const defaultLocale = "en";

export type MessageID = keyof typeof translations.en;

const resources = {
  en: { translation: translations.en },
  ru: { translation: translations.ru },
};

i18next.init({
  resources,
  lng: defaultLocale,
  fallbackLng: defaultLocale,
  interpolation: { escapeValue: false },
});

export const activateLocale = (locale: string) => {
  const lang = supportedLocales.includes(locale) ? locale : defaultLocale;
  i18next.changeLanguage(lang);
  console.log(`Activated locale: ${lang}`);
};

export const useT = () => {
  const { t: rawT } = useTranslation();
  return (key: MessageID, options?: Record<string, unknown>) => rawT(key, options);
};

// usage
// const t = useT()
