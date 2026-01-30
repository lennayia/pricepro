/**
 * Calculate hours by category type from time entries
 * @param {Array} timeEntries - Array of time entry objects
 * @param {Array<string>} categoryKeys - Array of category keys to sum
 * @returns {Object} { totalHours, breakdown: { categoryKey: hours } }
 */
export const calculateHoursByCategories = (timeEntries, categoryKeys) => {
  let totalHours = 0;
  const breakdown = {};

  // Initialize breakdown with 0 for all categories
  categoryKeys.forEach(key => {
    breakdown[key] = 0;
  });

  // Sum up hours for specified categories
  timeEntries.forEach(entry => {
    categoryKeys.forEach(categoryKey => {
      const hours = parseFloat(entry[categoryKey]) || 0;
      if (hours > 0) {
        totalHours += hours;
        breakdown[categoryKey] += hours;
      }
    });
  });

  return {
    totalHours,
    breakdown
  };
};

/**
 * Calculate billable hours (1:1 client work)
 * @param {Array} timeEntries - Array of time entry objects
 * @param {Array<string>} billableCategoryKeys - Array of billable category keys
 * @returns {Object} { totalBillableHours, breakdown }
 */
export const calculateBillableHours = (timeEntries, billableCategoryKeys) => {
  const result = calculateHoursByCategories(timeEntries, billableCategoryKeys);
  return {
    totalBillableHours: result.totalHours,
    breakdown: result.breakdown
  };
};

/**
 * Calculate scalable hours (investment in products/courses)
 * @param {Array} timeEntries - Array of time entry objects
 * @param {Array<string>} scalableCategoryKeys - Array of scalable category keys
 * @returns {Object} { totalScalableHours, breakdown }
 */
export const calculateScalableHours = (timeEntries, scalableCategoryKeys) => {
  const result = calculateHoursByCategories(timeEntries, scalableCategoryKeys);
  return {
    totalScalableHours: result.totalHours,
    breakdown: result.breakdown
  };
};

/**
 * Calculate weekly billable hours from time entries
 * @param {Array} timeEntries - Array of time entry objects for a week
 * @param {Array<string>} billableCategoryKeys - Array of billable category keys
 * @returns {number} Total billable hours for the week
 */
export const calculateWeeklyBillableHours = (timeEntries, billableCategoryKeys) => {
  const { totalBillableHours } = calculateBillableHours(timeEntries, billableCategoryKeys);
  return totalBillableHours;
};

/**
 * Calculate monthly billable hours (weekly * 4)
 * @param {number} weeklyBillableHours - Billable hours per week
 * @returns {number} Estimated monthly billable hours
 */
export const calculateMonthlyBillableHours = (weeklyBillableHours) => {
  return weeklyBillableHours * 4;
};

/**
 * Calculate required billable hours with/without passive income
 * @param {number} minimumMonthly - Minimum monthly income needed
 * @param {number} hourlyRate - Hourly rate
 * @param {number} passiveIncome - Monthly passive income (optional, default 0)
 * @returns {Object} { requiredHours, requiredHoursWithPassive, passiveIncome }
 */
export const calculateRequiredHours = (minimumMonthly, hourlyRate, passiveIncome = 0) => {
  if (hourlyRate === 0) {
    return { requiredHours: 0, requiredHoursWithPassive: 0, passiveIncome };
  }

  const requiredHours = minimumMonthly / hourlyRate;
  const requiredHoursWithPassive = Math.max(0, (minimumMonthly - passiveIncome) / hourlyRate);

  return {
    requiredHours: Math.round(requiredHours * 10) / 10, // Round to 1 decimal
    requiredHoursWithPassive: Math.round(requiredHoursWithPassive * 10) / 10,
    passiveIncome
  };
};
