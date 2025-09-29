let userId: string | null = null;
let readonlyMode = false;
let theme: ThemeMode = 'light'

type ThemeMode = 'light' | 'dark' | 'system';

export const setUserId = (id: string | null) => {
  userId = id;
};

export const getUserId = () => userId;

export const setReadonlyMode = (mode: boolean) => {
  readonlyMode = mode;
};

export const getReadonlyMode = () => readonlyMode;

export const setTheme = (_theme: ThemeMode ) => {
  theme = _theme;
};

export const getTheme = () => theme;