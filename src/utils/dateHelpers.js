/**
 * Date utility functions for Time Tracker
 * All dates use Monday as start of week (Czech convention)
 */

/**
 * Get Monday of the current week
 * @returns {Date} Monday date object
 */
export const getWeekStart = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(today);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0); // Reset time to midnight
  return monday;
};

/**
 * Get date string for a specific day number (1-7)
 * @param {number} dayNumber - Day number (1=Monday, 7=Sunday)
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getDateForDay = (dayNumber) => {
  if (dayNumber < 1 || dayNumber > 7) {
    throw new Error('Day number must be between 1 and 7');
  }

  const monday = getWeekStart();
  const date = new Date(monday);
  date.setDate(monday.getDate() + dayNumber - 1);
  return formatDateToISO(date);
};

/**
 * Convert date string to day number (1-7)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {number|null} Day number (1=Monday, 7=Sunday) or null if not in current week
 */
export const getDayNumber = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  const monday = getWeekStart();

  const diffTime = date - monday;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 0 && diffDays < 7) {
    return diffDays + 1;
  }

  return null; // Date not in current week
};

/**
 * Get array of all dates for the current week (Monday-Sunday)
 * @returns {string[]} Array of 7 dates in YYYY-MM-DD format
 */
export const getWeekDates = () => {
  const dates = [];
  for (let i = 1; i <= 7; i++) {
    dates.push(getDateForDay(i));
  }
  return dates;
};

/**
 * Format date to Czech day name abbreviation
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Day name (Po, Út, St, Čt, Pá, So, Ne)
 */
export const formatDayName = (dateString) => {
  const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
  const date = new Date(dateString + 'T00:00:00');
  return dayNames[date.getDay()];
};

/**
 * Check if a date is in the current week
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} True if date is in current week
 */
export const isCurrentWeek = (dateString) => {
  return getDayNumber(dateString) !== null;
};

/**
 * Format Date object to YYYY-MM-DD string
 * @param {Date} date - Date object
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get current week date range as formatted string
 * @returns {string} E.g., "20.1. - 26.1.2026"
 */
export const getWeekRangeString = () => {
  const monday = getWeekStart();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDay = monday.getDate();
  const startMonth = monday.getMonth() + 1;
  const endDay = sunday.getDate();
  const endMonth = sunday.getMonth() + 1;
  const year = sunday.getFullYear();

  return `${startDay}.${startMonth}. - ${endDay}.${endMonth}.${year}`;
};

/**
 * Get Monday date string for a given date
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @returns {string} Monday date in YYYY-MM-DD format
 */
export const getWeekStartDate = (date) => {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return formatDateToISO(monday);
};

/**
 * Format week range from week start date
 * @param {string} weekStartDate - Week start date in YYYY-MM-DD format
 * @returns {string} E.g., "27. 1. - 2. 2. 2026"
 */
export const formatWeekRange = (weekStartDate) => {
  const monday = new Date(weekStartDate + 'T00:00:00');
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDay = monday.getDate();
  const startMonth = monday.getMonth() + 1;
  const endDay = sunday.getDate();
  const endMonth = sunday.getMonth() + 1;
  const year = sunday.getFullYear();

  return `${startDay}. ${startMonth}. - ${endDay}. ${endMonth}. ${year}`;
};

/**
 * Add weeks to a date
 * @param {string} weekStartDate - Week start date in YYYY-MM-DD format
 * @param {number} weeks - Number of weeks to add (negative to subtract)
 * @returns {string} New week start date in YYYY-MM-DD format
 */
export const addWeeks = (weekStartDate, weeks) => {
  const date = new Date(weekStartDate + 'T00:00:00');
  date.setDate(date.getDate() + (weeks * 7));
  return formatDateToISO(date);
};

/**
 * Get array of all dates for a specific week
 * @param {string} weekStartDate - Week start date in YYYY-MM-DD format (optional, defaults to current week)
 * @returns {string[]} Array of 7 dates in YYYY-MM-DD format
 */
export const getWeekDatesForWeek = (weekStartDate) => {
  const monday = new Date(weekStartDate + 'T00:00:00');
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(formatDateToISO(date));
  }
  return dates;
};

/**
 * Get date string for a specific day number in a specific week
 * @param {number} dayNumber - Day number (1=Monday, 7=Sunday)
 * @param {string} weekStartDate - Week start date in YYYY-MM-DD format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getDateForDayInWeek = (dayNumber, weekStartDate) => {
  if (dayNumber < 1 || dayNumber > 7) {
    throw new Error('Day number must be between 1 and 7');
  }

  const monday = new Date(weekStartDate + 'T00:00:00');
  const date = new Date(monday);
  date.setDate(monday.getDate() + dayNumber - 1);
  return formatDateToISO(date);
};

/**
 * Format date to Czech format with day name
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} E.g., "Pondělí 27. 1. 2026"
 */
export const formatDateWithDayName = (dateString) => {
  const dayNames = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
  const date = new Date(dateString + 'T00:00:00');
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${dayName} ${day}. ${month}. ${year}`;
};
