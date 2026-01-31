/**
 * Centrální definice všech kategorií aktivit
 * Jediné místo pro správu kategorií v celé aplikaci
 */

import { CATEGORY_ICONS } from './icons';
import { CATEGORY_COLORS } from './colors';

// Kompletní definice všech kategorií
export const CATEGORY_DEFINITIONS = {
  // === PRACOVNÍ AKTIVITY ===
  client_communication: {
    key: 'client_communication',
    label: 'Komunikace s klienty',
    description: 'Hovory, schůzky, videohovory',
    icon: CATEGORY_ICONS.client_communication,
    type: 'work',
    color: CATEGORY_COLORS.work,
  },
  content_creation: {
    key: 'content_creation',
    label: 'Tvorba obsahu & marketing',
    description: 'Foto, video, texty, grafika, marketing, emailing',
    icon: CATEGORY_ICONS.content_creation,
    type: 'work',
    color: CATEGORY_COLORS.work,
  },
  social_media: {
    key: 'social_media',
    label: 'Sociální sítě',
    description: 'Scrollování, komentáře, stories',
    icon: CATEGORY_ICONS.social_media,
    type: 'work',
    color: CATEGORY_COLORS.work,
  },
  administration: {
    key: 'administration',
    label: 'Administrativa',
    description: 'Fakturace, účetnictví, e-maily',
    icon: CATEGORY_ICONS.administration,
    type: 'work',
    color: CATEGORY_COLORS.work,
  },
  messages: {
    key: 'messages',
    label: 'Odpovídání na zprávy',
    description: 'DMs, WhatsApp, Messenger',
    icon: CATEGORY_ICONS.messages,
    type: 'work',
    color: CATEGORY_COLORS.work,
  },
  education: {
    key: 'education',
    label: 'Vzdělávání',
    description: 'Kurzy, knihy, podcasty',
    icon: CATEGORY_ICONS.education,
    type: 'work',
    color: CATEGORY_COLORS.work,
  },
  billable_work: {
    key: 'billable_work',
    label: 'Práce pro klienty',
    description: 'Fakturovatelná práce',
    icon: CATEGORY_ICONS.billable_work,
    type: 'work',
    color: CATEGORY_COLORS.work,
  },
  digital_products: {
    key: 'digital_products',
    label: 'Tvorba digiproduktů a služeb',
    description: 'Kurzy, e-booky, produkty, služby',
    icon: CATEGORY_ICONS.digital_products,
    type: 'work',
    color: CATEGORY_COLORS.work,
  },
  other: {
    key: 'other',
    label: 'Ostatní / pauzy',
    description: 'Vše ostatní',
    icon: CATEGORY_ICONS.other,
    type: 'work',
    color: CATEGORY_COLORS.work,
  },

  // === OSOBNÍ ŽIVOT ===
  sleep: {
    key: 'sleep',
    label: 'Spánek',
    description: 'Doporučeno 7-8 hodin',
    icon: CATEGORY_ICONS.sleep,
    type: 'personal',
    color: CATEGORY_COLORS.personal,
    recommended: { min: 7, max: 8 },
  },
  family_time: {
    key: 'family_time',
    label: 'Rodina & přátelé',
    description: 'Čas s blízkými',
    icon: CATEGORY_ICONS.family_time,
    type: 'personal',
    color: CATEGORY_COLORS.personal,
    recommended: { min: 1, max: 3 },
  },
  pets: {
    key: 'pets',
    label: 'Čas se zvířaty',
    description: 'Péče o domácí mazlíčky',
    icon: CATEGORY_ICONS.pets,
    type: 'personal',
    color: CATEGORY_COLORS.personal,
  },
  fun: {
    key: 'fun',
    label: 'Zábava & koníčky',
    description: 'Volný čas, zábava, relaxace',
    icon: CATEGORY_ICONS.fun,
    type: 'personal',
    color: CATEGORY_COLORS.personal,
  },
  personal_time: {
    key: 'personal_time',
    label: 'Osobní péče',
    description: 'Hygiena, zdraví, self-care',
    icon: CATEGORY_ICONS.personal_time,
    type: 'personal',
    color: CATEGORY_COLORS.personal,
    recommended: { min: 1, max: 2 },
  },
};

// Helper: získat všechny kategorie daného typu
export const getCategoriesByType = (type) => {
  return Object.values(CATEGORY_DEFINITIONS).filter(cat => cat.type === type);
};

// Pracovní kategorie (seřazené)
export const WORK_CATEGORIES = getCategoriesByType('work');

// Osobní kategorie (seřazené)
export const PERSONAL_CATEGORIES = getCategoriesByType('personal');

// Všechny kategorie dohromady
export const ALL_CATEGORIES = [...WORK_CATEGORIES, ...PERSONAL_CATEGORIES];

// Helper: získat label pro klíč kategorie
export const getCategoryLabel = (key) => {
  return CATEGORY_DEFINITIONS[key]?.label || key;
};

// Helper: získat ikonu pro klíč kategorie
export const getCategoryIcon = (key) => {
  return CATEGORY_DEFINITIONS[key]?.icon;
};

// Helper: získat celou definici kategorie
export const getCategory = (key) => {
  return CATEGORY_DEFINITIONS[key];
};

// Objekt pouze s labely (pro zpětnou kompatibilitu)
export const CATEGORY_LABELS = Object.entries(CATEGORY_DEFINITIONS).reduce(
  (acc, [key, def]) => ({ ...acc, [key]: def.label }),
  {}
);

// Array pouze klíčů pracovních kategorií (pro zpětnou kompatibilitu)
export const WORK_CATEGORY_KEYS = WORK_CATEGORIES.map(cat => cat.key);

// Array pouze klíčů osobních kategorií (pro zpětnou kompatibilitu)
export const PERSONAL_CATEGORY_KEYS = PERSONAL_CATEGORIES.map(cat => cat.key);
