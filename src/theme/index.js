import { createTheme } from '@mui/material/styles';

/**
 * PricePro Theme - Bronze/Gold (light) & Green (dark)
 * Konzistentní s VibecodingPro designem
 */

// Light mode theme - Bronze/Gold aesthetic
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#CD7F32', // Bronze
      light: '#E39B5D',
      dark: '#A0522D', // Copper
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFD700', // Gold
      light: '#FFEB3B',
      dark: '#FFC107',
      contrastText: '#2E2E2E',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E2E2E',
      secondary: '#666666',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    divider: 'rgba(205, 127, 50, 0.2)',
  },
  typography: {
    fontFamily: '"Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16, // Increased from 12 to match VibecodingPro
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(205, 127, 50, 0.05)',
    '0px 1px 3px rgba(205, 127, 50, 0.1), 0px 1px 2px rgba(205, 127, 50, 0.06)',
    '0px 4px 6px -1px rgba(205, 127, 50, 0.1), 0px 2px 4px -1px rgba(205, 127, 50, 0.06)',
    '0px 10px 15px -3px rgba(205, 127, 50, 0.1), 0px 4px 6px -2px rgba(205, 127, 50, 0.05)',
    '0px 20px 25px -5px rgba(205, 127, 50, 0.15)',
    '0px 25px 50px -12px rgba(205, 127, 50, 0.25)',
    ...Array(18).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '10px 24px',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: '0px 4px 6px -1px rgba(205, 127, 50, 0.1)',
          '&:hover': {
            boxShadow: '0px 10px 15px -3px rgba(205, 127, 50, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(205, 127, 50, 0.2)',
          boxShadow: '0px 20px 60px rgba(205, 127, 50, 0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: 'rgba(205, 127, 50, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: '#CD7F32',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#CD7F32',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Dark mode theme - Green aesthetic
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0DDD0D', // Bright green
      light: '#3FE73F',
      dark: '#0AAA0A',
      contrastText: '#0A0A1A',
    },
    secondary: {
      main: '#1DE91D',
      light: '#4FFF4F',
      dark: '#0BC70B',
      contrastText: '#0A0A1A',
    },
    background: {
      default: '#05050F',
      paper: 'rgba(10, 10, 26, 0.8)',
    },
    text: {
      primary: '#E1E1E1',
      secondary: '#A0A0A0',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    divider: 'rgba(13, 221, 13, 0.2)',
  },
  typography: {
    fontFamily: '"Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(13, 221, 13, 0.05)',
    '0px 1px 3px rgba(13, 221, 13, 0.1), 0px 1px 2px rgba(13, 221, 13, 0.06)',
    '0px 4px 6px -1px rgba(13, 221, 13, 0.1), 0px 2px 4px -1px rgba(13, 221, 13, 0.06)',
    '0px 10px 15px -3px rgba(13, 221, 13, 0.1), 0px 4px 6px -2px rgba(13, 221, 13, 0.05)',
    '0px 20px 25px -5px rgba(13, 221, 13, 0.1)',
    '0px 25px 50px -12px rgba(13, 221, 13, 0.15)',
    ...Array(18).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '10px 24px',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: '0px 4px 6px -1px rgba(13, 221, 13, 0.1)',
          '&:hover': {
            boxShadow: '0px 10px 15px -3px rgba(13, 221, 13, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(13, 221, 13, 0.2)',
          boxShadow: '0px 20px 60px rgba(13, 221, 13, 0.1)',
          backgroundColor: 'rgba(10, 10, 26, 0.8)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(10, 10, 26, 0.5)',
            '& fieldset': {
              borderColor: 'rgba(13, 221, 13, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: '#0DDD0D',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0DDD0D',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Export function to get theme based on mode
export const getTheme = (mode) => mode === 'dark' ? darkTheme : lightTheme;

// Export light theme as default
export default lightTheme;
