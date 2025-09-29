import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3B82F6',
      dark: '#2563EB',
      light: '#60A5FA',
    },
    secondary: {
      main: '#F43F5E',
      dark: '#E11D48',
      light: '#FB7185',
    },
    success: {
      main: '#22C55E',
      dark: '#16A34A',
      light: '#4ADE80',
    },
    error: {
      main: '#EF4444',
      dark: '#DC2626',
      light: '#F87171',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F9F9F9',
    },
    text: {
      primary: '#242424',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    common: {
      white: '#FFFFFF',
    },
    divider: '#E1E5EA',
    action: {
      hover: '#E1E5EA',
      selected: '#E5EAF2',
      disabled: '#BBBBBB',
    },
  },
  zIndex: {
    appBar: 100,
    drawer: 90,
    modal: 110,
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6',
      dark: '#2563EB',
      light: '#60A5FA',
    },
    secondary: {
      main: '#F43F5E',
      dark: '#E11D48',
      light: '#FB7185',
    },
    success: {
      main: '#22C55E',
      dark: '#16A34A',
      light: '#4ADE80',
    },
    error: {
      main: '#EF4444',
      dark: '#DC2626',
      light: '#F87171',
    },
    background: {
      default: '#1F1F1F',
      paper: '#181818',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
      disabled: '#6B7280',
    },
    common: {
      white: "#FFFFFF",
    },
    divider: '#393E46',
    action: {
      hover: '#393E46',
      selected: '#222831',
      disabled: '#BBBBBB',
    },
  },
  zIndex: {
    appBar: 100,
    drawer: 90,
    modal: 110,
  },
});