/**
 * Doporučené hodnoty a prahy pro zdravý životní styl
 * Centrální místo pro všechny health-related konstanty
 */

// Doporučené hodnoty pro jednotlivé oblasti
export const RECOMMENDED_VALUES = {
  sleep: {
    min: 7,
    max: 8,
    critical: 6,      // Pod touto hodnotou je kritické
    excessive: 9,     // Nad touto hodnotou je příliš mnoho
  },
  work: {
    optimal: 8,       // Optimální denní práce
    warning: 10,      // Začíná být hodně
    critical: 12,     // Přetížení
  },
  personalTime: {
    min: 1,
    warning: 0.5,     // Pod touto hodnotou varování
  },
  familyTime: {
    min: 1,
    warning: 0.5,     // Pod touto hodnotou varování
  },
};

// Prahy pro health score penalizace
export const HEALTH_SCORE_PENALTIES = {
  sleep: {
    critical: 40,     // Spánek < 6h
    low: 20,          // Spánek < 7h
    excessive: 10,    // Spánek > 9h
  },
  work: {
    critical: 30,     // Práce > 12h
    high: 15,         // Práce > 10h
  },
  personalTime: {
    critical: 20,     // Osobní čas < 0.5h
    low: 10,          // Osobní čas < 1h
  },
  familyTime: {
    critical: 10,     // Čas s rodinou < 0.5h
    low: 5,           // Čas s rodinou < 1h
  },
};

// Kategorie health score (0-100)
export const HEALTH_SCORE_CATEGORIES = {
  excellent: {
    min: 80,
    label: 'Vynikající',
    icon: '✅',
    description: 'Skvělý work-life balance!',
  },
  good: {
    min: 70,
    max: 79,
    label: 'Dobré',
    icon: '👍',
    description: 'Celkem dobrý balanc, drobné vylepšení možná.',
  },
  warning: {
    min: 60,
    max: 69,
    label: 'Lze zlepšit',
    icon: '⚠️',
    description: 'Pozor na některé oblasti!',
  },
  critical: {
    max: 59,
    label: 'Varování',
    icon: '🚨',
    description: 'Riziko vyhoření! Nutné změny.',
  },
};

// Helper: získat kategorii health score
export const getHealthScoreCategory = (score) => {
  if (score >= HEALTH_SCORE_CATEGORIES.excellent.min) {
    return HEALTH_SCORE_CATEGORIES.excellent;
  }
  if (score >= HEALTH_SCORE_CATEGORIES.good.min) {
    return HEALTH_SCORE_CATEGORIES.good;
  }
  if (score >= HEALTH_SCORE_CATEGORIES.warning.min) {
    return HEALTH_SCORE_CATEGORIES.warning;
  }
  return HEALTH_SCORE_CATEGORIES.critical;
};

// Konstanty pro den
export const TIME_CONSTANTS = {
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
};
