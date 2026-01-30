import { supabase } from './supabase';

/**
 * Get all category settings for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of category settings
 */
export const getCategorySettings = async (userId) => {
  const { data, error } = await supabase
    .from('user_category_settings')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching category settings:', error);
    throw new Error('Nepodařilo se načíst nastavení kategorií.');
  }

  return data || [];
};

/**
 * Update category type
 * @param {string} userId - User ID
 * @param {string} categoryKey - Category key
 * @param {string} categoryType - Category type: 'billable', 'scalable', or 'other'
 * @returns {Promise<Object>} Updated setting
 */
export const updateCategoryType = async (userId, categoryKey, categoryType) => {
  const { data, error } = await supabase
    .from('user_category_settings')
    .update({ category_type: categoryType, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('category_key', categoryKey)
    .select()
    .single();

  if (error) {
    console.error('Error updating category setting:', error);
    throw new Error('Nepodařilo se aktualizovat nastavení kategorie.');
  }

  return data;
};

/**
 * Bulk update category settings
 * @param {string} userId - User ID
 * @param {Array} settings - Array of {categoryKey, categoryType}
 * @returns {Promise<Array>} Updated settings
 */
export const updateCategorySettings = async (userId, settings) => {
  const updates = settings.map(({ categoryKey, categoryType }) =>
    supabase
      .from('user_category_settings')
      .update({ category_type: categoryType, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('category_key', categoryKey)
  );

  const results = await Promise.all(updates);

  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.error('Errors updating category settings:', errors);
    throw new Error('Nepodařilo se aktualizovat všechna nastavení.');
  }

  return results.map(r => r.data);
};

/**
 * Get category keys by type for a user
 * @param {string} userId - User ID
 * @param {string} categoryType - Type: 'billable', 'scalable', or 'other'
 * @returns {Promise<Array<string>>} Array of category keys
 */
export const getCategoryKeysByType = async (userId, categoryType) => {
  const settings = await getCategorySettings(userId);
  return settings
    .filter(s => s.category_type === categoryType)
    .map(s => s.category_key);
};

/**
 * Get billable category keys for a user (shortcut)
 * @param {string} userId - User ID
 * @returns {Promise<Array<string>>} Array of billable category keys
 */
export const getBillableCategoryKeys = async (userId) => {
  return getCategoryKeysByType(userId, 'billable');
};

/**
 * Get scalable category keys for a user (shortcut)
 * @param {string} userId - User ID
 * @returns {Promise<Array<string>>} Array of scalable category keys
 */
export const getScalableCategoryKeys = async (userId) => {
  return getCategoryKeysByType(userId, 'scalable');
};
