import { useEffect, useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "@/styles/theme";
import { setTheme } from "@/global/appState";
import { ThemeContext, THEME_STORAGE_KEY, ThemeMode } from "@/contexts/ThemeContext";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setModeState] = useState<ThemeMode>(() => {
    const currentTheme =
      (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || "system";
    setTheme(currentTheme);
    return currentTheme;
  });

  const [systemMode, setSystemMode] = useState<"light" | "dark">("dark");

  const setThemeMode = (newMode: ThemeMode) => {
    setTheme(newMode);
    setModeState(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
    document.body.className =
      newMode === "light" ? "theme-light" : "theme-dark";
  };

  useEffect(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (savedMode) {
      setModeState(savedMode);
    }

    const matchDark = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemMode(matchDark.matches ? "dark" : "light");
    };

    handleChange();
    matchDark.addEventListener("change", handleChange);

    return () => {
      matchDark.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const finalMode = themeMode === "system" ? systemMode : themeMode;
    document.body.className =
      finalMode === "light" ? "theme-light" : "theme-dark";
    setTheme(finalMode);
  }, [themeMode, systemMode]);

  const finalMode = themeMode === "system" ? systemMode : themeMode;

  const theme = useMemo(
    () => (finalMode === "light" ? lightTheme : darkTheme),
    [finalMode]
  );

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};