/**
 * Breakpoints - Jednotné body zlomu pro responzivní design
 * Používá se v MUI theme a pro custom media queries
 */

export const BREAKPOINTS = {
  xs: 0,      // Extra small: všechny mobily (včetně 320px iPhone SE)
  sm: 600,    // Small: mobily landscape, malé tablety
  md: 840,    // Medium: tablety landscape, malé notebooky
  lg: 1200,   // Large: desktopy
  xl: 1536,   // Extra large: velké desktopy
};

// Media queries pro přímé použití v CSS-in-JS
export const MEDIA_QUERIES = {
  xs: '@media (min-width: 0px)',
  sm: '@media (min-width: 600px)',
  md: '@media (min-width: 840px)',
  lg: '@media (min-width: 1200px)',
  xl: '@media (min-width: 1536px)',
};

// Pomocné funkce
export const isXs = (width) => width < BREAKPOINTS.sm;
export const isSm = (width) => width >= BREAKPOINTS.sm && width < BREAKPOINTS.md;
export const isMd = (width) => width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
export const isLg = (width) => width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
export const isXl = (width) => width >= BREAKPOINTS.xl;
