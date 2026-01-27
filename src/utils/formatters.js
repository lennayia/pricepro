/**
 * Formátovací utility pro konzistentní zobrazení dat
 */

/**
 * Formátuje hodiny s jedním desetinným místem
 * @param {number} hours - Počet hodin
 * @returns {string} Formátované hodiny (např. "7.5")
 */
export const formatHours = (hours) => {
  if (hours === null || hours === undefined || isNaN(hours)) {
    return '0.0';
  }
  return parseFloat(hours).toFixed(1);
};

/**
 * Formátuje hodiny s jednotkou
 * @param {number} hours - Počet hodin
 * @param {string} unit - Jednotka (výchozí "hod")
 * @returns {string} Formátované hodiny s jednotkou (např. "7.5 hod")
 */
export const formatHoursWithUnit = (hours, unit = 'hod') => {
  return `${formatHours(hours)} ${unit}`;
};

/**
 * Formátuje procento s jedním desetinným místem
 * @param {number} percentage - Procento (0-100)
 * @returns {string} Formátované procento (např. "75.5%")
 */
export const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return '0.0%';
  }
  return `${parseFloat(percentage).toFixed(1)}%`;
};

/**
 * Formátuje počet dní
 * @param {number} days - Počet dní
 * @param {number} total - Celkový počet dní (výchozí 7)
 * @returns {string} Formátovaný text (např. "3 / 7 dní")
 */
export const formatDayProgress = (days, total = 7) => {
  return `${days} / ${total} dní`;
};

/**
 * Formátuje průměr na den
 * @param {number} total - Celkový součet
 * @param {number} days - Počet dní
 * @returns {string} Formátovaný průměr (např. "2.5h/den")
 */
export const formatAveragePerDay = (total, days) => {
  if (days === 0) return '0.0h/den';
  const average = total / days;
  return `${formatHours(average)}h/den`;
};

/**
 * Formátuje číslo s měrnou jednotkou
 * @param {number} value - Hodnota
 * @param {string} unit - Jednotka
 * @returns {string} Formátovaná hodnota s jednotkou
 */
export const formatWithUnit = (value, unit) => {
  return `${formatHours(value)} ${unit}`;
};

/**
 * Formátuje rozsah hodin
 * @param {number} min - Minimální hodnota
 * @param {number} max - Maximální hodnota
 * @returns {string} Rozsah (např. "7-8h")
 */
export const formatHoursRange = (min, max) => {
  return `${formatHours(min)}-${formatHours(max)}h`;
};

/**
 * Zkrácený formát pro hodiny (bez desetinných míst pokud je to celé číslo)
 * @param {number} hours - Počet hodin
 * @returns {string} Formátované hodiny (např. "7" nebo "7.5")
 */
export const formatHoursCompact = (hours) => {
  if (hours === null || hours === undefined || isNaN(hours)) {
    return '0';
  }
  const num = parseFloat(hours);
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
};
