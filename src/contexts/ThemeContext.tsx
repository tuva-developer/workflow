import { createContext } from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextProps {
  themeMode: ThemeMode;
  setThemeMode: (themeMode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const THEME_STORAGE_KEY = "vbd_wf_theme";