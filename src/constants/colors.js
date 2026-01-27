/**
 * Jednotná barevná paleta pro celou aplikaci
 * Mírnější tóny pro UI, pestřejší pro grafy
 */

// Hlavní barvy aplikace (konzervativnější tóny)
export const COLORS = {
  primary: {
    main: '#6366F1',    // indigo - hlavní brand barva
    light: '#818CF8',
    dark: '#4F46E5',
    contrast: '#FFFFFF',
  },
  success: {
    main: '#10B981',    // emerald - pozitivní akce
    light: '#34D399',
    dark: '#059669',
    contrast: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B',    // amber - varování
    light: '#FBBF24',
    dark: '#D97706',
    contrast: '#FFFFFF',
  },
  error: {
    main: '#EF4444',    // red - chyby
    light: '#F87171',
    dark: '#DC2626',
    contrast: '#FFFFFF',
  },
  info: {
    main: '#3B82F6',    // blue - informace
    light: '#60A5FA',
    dark: '#2563EB',
    contrast: '#FFFFFF',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// Gradienty pro důležité UI prvky
export const GRADIENTS = {
  success: `linear-gradient(135deg, ${COLORS.success.main} 0%, ${COLORS.success.dark} 100%)`,
  warning: `linear-gradient(135deg, ${COLORS.warning.main} 0%, ${COLORS.warning.dark} 100%)`,
  error: `linear-gradient(135deg, ${COLORS.error.main} 0%, ${COLORS.error.dark} 100%)`,
  primary: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.dark} 100%)`,
  info: `linear-gradient(135deg, ${COLORS.info.main} 0%, ${COLORS.info.dark} 100%)`,
};

// Barvy specifické pro grafy (pestřejší paleta)
export const CHART_COLORS = [
  '#6366F1', // indigo
  '#EC4899', // pink
  '#10B981', // emerald
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#14B8A6', // teal
  '#64748B', // slate
];

// Health score barvy
export const HEALTH_SCORE_COLORS = {
  excellent: {
    gradient: GRADIENTS.success,
    color: COLORS.success.main,
    label: 'Vynikající',
    icon: '✅',
  },
  good: {
    gradient: GRADIENTS.info,
    color: COLORS.info.main,
    label: 'Dobré',
    icon: '👍',
  },
  warning: {
    gradient: GRADIENTS.warning,
    color: COLORS.warning.main,
    label: 'Lze zlepšit',
    icon: '⚠️',
  },
  critical: {
    gradient: GRADIENTS.error,
    color: COLORS.error.main,
    label: 'Varování',
    icon: '🚨',
  },
};

// Kategorie barev (pro work vs personal)
export const CATEGORY_COLORS = {
  work: COLORS.primary.main,
  personal: COLORS.success.main,
};
