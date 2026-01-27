/**
 * Centralizované výpočty pro Time Tracker
 * Všechny matematické operace na jednom místě
 */

import { WORK_CATEGORY_KEYS, PERSONAL_CATEGORY_KEYS } from '../constants/categories';

/**
 * Vypočítá celkový součet pro jednu kategorii
 * @param {Array} entries - Array time entries
 * @param {string} categoryKey - Klíč kategorie
 * @returns {number} Celkový součet hodin
 */
export const calculateCategoryTotal = (entries, categoryKey) => {
  return entries.reduce((sum, entry) => {
    return sum + (parseFloat(entry[categoryKey]) || 0);
  }, 0);
};

/**
 * Vypočítá součty pro všechny kategorie
 * @param {Array} entries - Array time entries
 * @param {Array} categoryKeys - Array klíčů kategorií
 * @returns {Object} Objekt s součty pro každou kategorii
 */
export const calculateCategoryTotals = (entries, categoryKeys) => {
  return categoryKeys.reduce((acc, key) => {
    acc[key] = calculateCategoryTotal(entries, key);
    return acc;
  }, {});
};

/**
 * Vypočítá celkový součet pro skupinu kategorií
 * @param {Object} totals - Objekt s totals
 * @param {Array} categoryKeys - Array klíčů kategorií
 * @returns {number} Celkový součet
 */
export const calculateGroupTotal = (totals, categoryKeys) => {
  return categoryKeys.reduce((sum, key) => {
    return sum + (totals[key] || 0);
  }, 0);
};

/**
 * Vypočítá celkový součet ze všech hodnot objektu
 * @param {Object} data - Objekt s hodnotami (např. formData)
 * @returns {number} Celkový součet
 */
export const calculateTotalHours = (data) => {
  return Object.values(data).reduce((sum, val) => {
    return sum + (parseFloat(val) || 0);
  }, 0);
};

/**
 * Vypočítá pracovní hodiny z formData nebo totals
 * @param {Object} data - Objekt s hodnotami
 * @returns {number} Celkové pracovní hodiny
 */
export const calculateWorkHours = (data) => {
  return WORK_CATEGORY_KEYS.reduce((sum, key) => {
    return sum + (parseFloat(data[key]) || 0);
  }, 0);
};

/**
 * Vypočítá osobní hodiny z formData nebo totals
 * @param {Object} data - Objekt s hodnotami
 * @returns {number} Celkové osobní hodiny
 */
export const calculatePersonalHours = (data) => {
  return PERSONAL_CATEGORY_KEYS.reduce((sum, key) => {
    return sum + (parseFloat(data[key]) || 0);
  }, 0);
};

/**
 * Vypočítá procento
 * @param {number} value - Hodnota
 * @param {number} total - Celkový součet
 * @returns {number} Procento (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Vypočítá průměr
 * @param {number} total - Celkový součet
 * @param {number} days - Počet dní
 * @returns {number} Průměr
 */
export const calculateAverage = (total, days) => {
  if (days === 0) return 0;
  return total / days;
};

/**
 * Vypočítá průměry pro všechny kategorie
 * @param {Object} totals - Objekt s celkovými součty
 * @param {number} days - Počet dní
 * @returns {Object} Objekt s průměry
 */
export const calculateAverages = (totals, days) => {
  const averages = {};
  Object.keys(totals).forEach(key => {
    averages[key] = calculateAverage(totals[key], days);
  });
  return averages;
};

/**
 * Najde největší hodnotu v objektu
 * @param {Object} data - Objekt s hodnotami
 * @param {Array} excludeKeys - Klíče k vyloučení (např. billable_work)
 * @returns {Object} { key, value } největší hodnoty
 */
export const findBiggest = (data, excludeKeys = []) => {
  let biggest = { key: '', value: 0 };

  Object.entries(data).forEach(([key, value]) => {
    if (!excludeKeys.includes(key) && value > biggest.value) {
      biggest = { key, value };
    }
  });

  return biggest;
};

/**
 * Spočítá kolik dní má vyplněná data
 * @param {Array} weekData - Array dat pro týden
 * @param {Array} categoryKeys - Klíče kategorií k testování
 * @returns {number} Počet vyplněných dní
 */
export const countCompletedDays = (weekData, categoryKeys) => {
  return weekData.filter(day => {
    return categoryKeys.some(key => (day[key] || 0) > 0);
  }).length;
};
