/**
 * Jednotná barevná paleta pro celou aplikaci
 * Mírnější tóny pro UI, pestřejší pro grafy
 */

// Hlavní barvy aplikace (konzervativnější tóny)
export const COLORS = {
  primary: {
    main: '#CD7F32',    // bronze - hlavní brand barva
    light: '#E39B5D',
    dark: '#A0522D',    // copper
    contrast: '#FFFFFF',
  },
  secondary: {
    main: '#FFD700',    // gold - sekundární barva
    light: '#FFEB3B',
    dark: '#FFC107',
    contrast: '#000000',
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

// Barvy specifické pro grafy - modulární pro light/dark mode
export const CHART_COLORS_LIGHT = [
  '#CD7F32', // 0 - bronze/bronzová (PRIMARY) - billable_work
  '#FFD700', // 1 - gold/zlatá - client_communication
  '#10B981', // 2 - emerald/smaragdová - sytější zelená - other
  '#EF4444', // 3 - red/červená - sytější - messages
  '#EC4899', // 4 - pink/růžová - family_time
  '#9333EA', // 5 - purple/fialová - sleep
  '#2563EB', // 6 - dark blue/tmavě modrá - social_media
  '#00BFFF', // 7 - deep sky blue/sytější světle modrá - personal_time
  '#D4FF00', // 8 - bright lime/jasně limetková - content_creation
  '#A0522D', // 9 - copper/měděná - administration
  '#1E3A8A', // 10 - very dark blue/velmi tmavě modrá - education
];

export const CHART_COLORS_DARK = [
  'rgba(0, 255, 0, 0.8)', // 0 - neon green - billable_work
  'rgba(255, 215, 0, 0.8)', // 1 - gold/zlatá - client_communication
  'rgba(255, 102, 0, 0.8)', // 2 - neon orange - other
  'rgba(255, 0, 0, 0.8)', // 3 - neon red - messages
  'rgba(255, 0, 255, 0.8)', // 4 - neon pink/magenta - family_time
  'rgba(157, 0, 255, 0.8)', // 5 - neon purple - sleep
  'rgba(0, 128, 255, 0.8)', // 6 - neon blue - social_media
  'rgba(0, 255, 255, 0.8)', // 7 - neon cyan - personal_time
  'rgba(204, 255, 0, 0.8)', // 8 - neon lime - content_creation
  'rgba(160, 82, 45, 0.8)', // 9 - copper/měděná - administration
  'rgba(30, 58, 138, 0.8)', // 10 - dark blue/tmavě modrá - education
];

// Helper funkce pro získání chart colors podle módu
export const getChartColors = (mode) =>
  mode === 'dark' ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;

// Zpětná kompatibilita - defaultně light
export const CHART_COLORS = CHART_COLORS_LIGHT;

// Lime color pro dark mode akcenty
export const LIME_COLOR = '#D4FF00';

// Health score barvy
export const HEALTH_SCORE_COLORS = {
  excellent: {
    gradient: GRADIENTS.primary,
    color: COLORS.primary.main,
    label: 'Vynikající',
    icon: '✅',
  },
  good: {
    gradient: `linear-gradient(135deg, ${COLORS.neutral[600]} 0%, ${COLORS.neutral[700]} 100%)`,
    color: COLORS.neutral[600],
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
  work: COLORS.neutral[600],
  personal: COLORS.neutral[600],
};

// Info card styles - modulární styly pro informační karty
export const INFO_CARD_STYLES = {
  light: {
    bgcolor: 'rgba(205, 127, 50, 0.15)', // bronze opacity
    border: '1px solid rgba(205, 127, 50, 0.3)',
    iconBg: 'rgba(205, 127, 50, 0.2)',
    iconColor: '#CD7F32',
  },
  dark: {
    bgcolor: 'rgba(13, 221, 13, 0.15)', // green opacity
    border: '1px solid rgba(13, 221, 13, 0.3)',
    iconBg: 'rgba(13, 221, 13, 0.2)',
    iconColor: '#0DDD0D',
  },
};

// Card icon styles - modulární styly pro ikony na kartách
export const CARD_ICON_STYLES = {
  light: {
    bgcolor: 'rgba(255, 255, 255, 0.6)', // bílá opacity
    iconColor: COLORS.neutral[600],
  },
  dark: {
    bgcolor: 'rgba(255, 255, 255, 0.1)', // bílá opacity pro dark mode
    iconColor: 'rgba(255, 255, 255, 0.7)',
  },
};

// Warning card styles - modulární styly pro warning karty (insight cards)
export const WARNING_CARD_STYLES = {
  light: {
    bgcolor: 'rgba(255, 215, 0, 0.15)', // zlatá opacity
    border: '1px solid rgba(245, 158, 11, 0.3)', // oranžový border
    iconColor: COLORS.warning.main,
  },
  dark: {
    bgcolor: 'rgba(255, 255, 255, 0.1)', // bílá opacity
    border: '1px solid rgba(13, 221, 13, 0.3)', // neon zelený border
    iconColor: '#0DDD0D',
  },
};

// Helper funkce pro získání info card stylů podle módu
export const getInfoCardStyles = (mode) => INFO_CARD_STYLES[mode] || INFO_CARD_STYLES.light;

// Helper funkce pro získání card icon stylů podle módu
export const getCardIconStyles = (mode) => CARD_ICON_STYLES[mode] || CARD_ICON_STYLES.light;
