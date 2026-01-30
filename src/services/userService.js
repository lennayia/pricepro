import { supabase } from './supabase';

/**
 * Get user's selected week start date from database
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Selected week start date (YYYY-MM-DD) or null if not set
 */
export const getSelectedWeekStart = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('selected_week_start')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching selected week:', error);
      return null;
    }

    return data?.selected_week_start || null;
  } catch (err) {
    console.error('Error in getSelectedWeekStart:', err);
    return null;
  }
};

/**
 * Update user's selected week start date in database
 * @param {string} userId - User ID
 * @param {string} weekStartDate - Week start date (YYYY-MM-DD format)
 * @returns {Promise<boolean>} Success status
 */
export const updateSelectedWeekStart = async (userId, weekStartDate) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        selected_week_start: weekStartDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating selected week:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateSelectedWeekStart:', err);
    return false;
  }
};

/**
 * Clear user's selected week (set to null, which means "use current week")
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const clearSelectedWeekStart = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        selected_week_start: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error clearing selected week:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in clearSelectedWeekStart:', err);
    return false;
  }
};
