/**
 * Health Score kalkulace a logika
 * Extrahováno z UI komponent pro lepší testovatelnost
 */

import {
  RECOMMENDED_VALUES,
  HEALTH_SCORE_PENALTIES,
  getHealthScoreCategory as getCategory,
} from '../constants/healthThresholds';
import { HEALTH_SCORE_COLORS } from '../constants/colors';

/**
 * Vypočítá health score na základě průměrných hodnot
 * @param {number} avgSleep - Průměrný spánek (hodiny/den)
 * @param {number} avgWork - Průměrná práce (hodiny/den)
 * @param {number} avgPersonal - Průměrný osobní čas (hodiny/den)
 * @param {number} avgFamily - Průměrný čas s rodinou (hodiny/den)
 * @returns {number} Health score (0-100)
 */
export const calculateHealthScore = (avgSleep, avgWork, avgPersonal, avgFamily) => {
  let score = 100;

  // Penalizace za spánek
  if (avgSleep < RECOMMENDED_VALUES.sleep.critical) {
    score -= HEALTH_SCORE_PENALTIES.sleep.critical;
  } else if (avgSleep < RECOMMENDED_VALUES.sleep.min) {
    score -= HEALTH_SCORE_PENALTIES.sleep.low;
  } else if (avgSleep > RECOMMENDED_VALUES.sleep.excessive) {
    score -= HEALTH_SCORE_PENALTIES.sleep.excessive;
  }

  // Penalizace za přetížení prací
  if (avgWork > RECOMMENDED_VALUES.work.critical) {
    score -= HEALTH_SCORE_PENALTIES.work.critical;
  } else if (avgWork > RECOMMENDED_VALUES.work.warning) {
    score -= HEALTH_SCORE_PENALTIES.work.high;
  }

  // Penalizace za nedostatek osobního času
  if (avgPersonal < RECOMMENDED_VALUES.personalTime.warning) {
    score -= HEALTH_SCORE_PENALTIES.personalTime.critical;
  } else if (avgPersonal < RECOMMENDED_VALUES.personalTime.min) {
    score -= HEALTH_SCORE_PENALTIES.personalTime.low;
  }

  // Penalizace za nedostatek času s rodinou
  if (avgFamily < RECOMMENDED_VALUES.familyTime.warning) {
    score -= HEALTH_SCORE_PENALTIES.familyTime.critical;
  } else if (avgFamily < RECOMMENDED_VALUES.familyTime.min) {
    score -= HEALTH_SCORE_PENALTIES.familyTime.low;
  }

  return Math.max(0, score);
};

/**
 * Získá kategorii health score (excellent, good, warning, critical)
 * @param {number} score - Health score (0-100)
 * @returns {Object} Kategorie s label, icon, description
 */
export const getHealthScoreCategory = (score) => {
  return getCategory(score);
};

/**
 * Získá barvy pro health score
 * @param {number} score - Health score (0-100)
 * @returns {Object} { gradient, color }
 */
export const getHealthScoreColors = (score) => {
  const category = getHealthScoreCategory(score);

  if (score >= 80) return HEALTH_SCORE_COLORS.excellent;
  if (score >= 70) return HEALTH_SCORE_COLORS.good;
  if (score >= 60) return HEALTH_SCORE_COLORS.warning;
  return HEALTH_SCORE_COLORS.critical;
};

/**
 * Generuje personalizovaná doporučení na základě průměrů
 * @param {Object} averages - { avgSleep, avgWork, avgPersonal, avgFamily }
 * @returns {Array} Array doporučení { type, message }
 */
export const generateRecommendations = ({ avgSleep, avgWork, avgPersonal, avgFamily }) => {
  const recommendations = [];

  // Doporučení pro spánek
  if (avgSleep < RECOMMENDED_VALUES.sleep.critical) {
    recommendations.push({
      type: 'critical',
      category: 'sleep',
      message: `🚨 Kriticky málo spánku! Průměrně spíte jen ${avgSleep.toFixed(1)}h denně. Minimálně ${RECOMMENDED_VALUES.sleep.min} hodin je nutné pro zdraví a produktivitu.`,
    });
  } else if (avgSleep < RECOMMENDED_VALUES.sleep.min) {
    recommendations.push({
      type: 'warning',
      category: 'sleep',
      message: `💤 Málo spánku: Zkuste přidat 30-60 minut spánku denně. Doporučujeme ${RECOMMENDED_VALUES.sleep.min}-${RECOMMENDED_VALUES.sleep.max} hodin pro optimální výkon.`,
    });
  }

  // Doporučení pro práci
  if (avgWork > RECOMMENDED_VALUES.work.critical) {
    recommendations.push({
      type: 'critical',
      category: 'work',
      message: `⚠️ Přetížení prací! Pracujete průměrně ${avgWork.toFixed(1)}h denně. Riziko vyhoření je vysoké. Zkuste delegovat nebo automatizovat úkoly.`,
    });
  } else if (avgWork > RECOMMENDED_VALUES.work.warning) {
    recommendations.push({
      type: 'warning',
      category: 'work',
      message: `💼 Hodně práce: Sledujte svou produktivitu. Může být čas na efektivnější pracovní metody?`,
    });
  }

  // Doporučení pro osobní čas
  if (avgPersonal < RECOMMENDED_VALUES.personalTime.warning) {
    recommendations.push({
      type: 'warning',
      category: 'personal',
      message: `🎯 Chybí osobní čas: Najděte si denně aspoň 30 minut pro koníčky, sport nebo relaxaci. Je to investice do vaší produktivity!`,
    });
  }

  // Doporučení pro rodinu
  if (avgFamily < RECOMMENDED_VALUES.familyTime.warning) {
    recommendations.push({
      type: 'warning',
      category: 'family',
      message: `👨‍👩‍👧 Málo času s blízkými: Kvalitní vztahy jsou základ spokojeného života. Plánujte pravidelný čas s rodinou a přáteli.`,
    });
  }

  // Pokud je vše v pořádku
  if (
    avgSleep >= RECOMMENDED_VALUES.sleep.min &&
    avgSleep <= RECOMMENDED_VALUES.sleep.max &&
    avgWork <= RECOMMENDED_VALUES.work.warning &&
    avgPersonal >= RECOMMENDED_VALUES.personalTime.min &&
    avgFamily >= RECOMMENDED_VALUES.familyTime.min
  ) {
    recommendations.push({
      type: 'success',
      category: 'overall',
      message: `✅ Výborný balanc! Máte zdravý poměr mezi prací, odpočinkem a osobním životem. Pokračujte v tom!`,
    });
  }

  return recommendations;
};

/**
 * Generuje krátké statusy pro jednotlivé metriky
 * @param {number} avgSleep - Průměrný spánek
 * @param {number} avgWork - Průměrná práce
 * @param {number} avgPersonal - Průměrný osobní čas
 * @param {number} avgFamily - Průměrný čas s rodinou
 * @returns {Object} Statusy pro každou metriku
 */
export const getMetricStatuses = (avgSleep, avgWork, avgPersonal, avgFamily) => {
  return {
    sleep: {
      value: avgSleep,
      status:
        avgSleep < RECOMMENDED_VALUES.sleep.critical
          ? 'critical'
          : avgSleep >= RECOMMENDED_VALUES.sleep.min &&
            avgSleep <= RECOMMENDED_VALUES.sleep.max
          ? 'ideal'
          : 'warning',
      label:
        avgSleep < RECOMMENDED_VALUES.sleep.critical
          ? '🚨 Kriticky málo!'
          : avgSleep >= RECOMMENDED_VALUES.sleep.min &&
            avgSleep <= RECOMMENDED_VALUES.sleep.max
          ? '✅ Ideální'
          : '',
    },
    work: {
      value: avgWork,
      status:
        avgWork > RECOMMENDED_VALUES.work.critical
          ? 'critical'
          : avgWork > RECOMMENDED_VALUES.work.warning
          ? 'warning'
          : avgWork <= RECOMMENDED_VALUES.work.optimal
          ? 'ideal'
          : 'good',
      label:
        avgWork > RECOMMENDED_VALUES.work.critical
          ? '⚠️ Přetížení!'
          : avgWork <= RECOMMENDED_VALUES.work.optimal
          ? '✅ Zdravý balanc'
          : '',
    },
    family: {
      value: avgFamily,
      status: avgFamily < RECOMMENDED_VALUES.familyTime.warning ? 'warning' : 'good',
      label: avgFamily < RECOMMENDED_VALUES.familyTime.warning ? '⚠️ Věnujte více času blízkým' : '',
    },
    personal: {
      value: avgPersonal,
      status: avgPersonal < RECOMMENDED_VALUES.personalTime.warning ? 'warning' : 'good',
      label: avgPersonal < RECOMMENDED_VALUES.personalTime.warning ? '⚠️ Nezapomínejte na sebe!' : '',
    },
  };
};
