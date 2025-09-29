import { createContext } from "react";

export type Language = "vi" | "en";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LANGUAGE_STORAGE_KEY = "language";

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);