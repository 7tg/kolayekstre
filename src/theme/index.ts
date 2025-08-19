import { createTheme, Theme } from '@mui/material/styles';

const createAppTheme = (isDark: boolean): Theme => {
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#90caf9' : '#1976d2',
        light: isDark ? '#bbdefb' : '#42a5f5',
        dark: isDark ? '#64b5f6' : '#1565c0',
      },
      secondary: {
        main: isDark ? '#f48fb1' : '#dc004e',
        light: isDark ? '#f8bbd9' : '#e91e63',
        dark: isDark ? '#f06292' : '#c51162',
      },
      background: {
        default: isDark ? '#121212' : '#fafafa',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#000000',
        secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });
};

export default createAppTheme;