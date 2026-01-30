import { supabase } from './supabase';

/**
 * Get all project themes for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of theme objects
 */
export const getProjectThemes = async (userId) => {
  const { data, error } = await supabase
    .from('project_themes')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching project themes:', error);
    throw new Error('Nepodařilo se načíst témata.');
  }

  return data || [];
};

/**
 * Get a single theme by ID
 * @param {string} themeId - Theme ID
 * @returns {Promise<Object|null>} Theme object or null
 */
export const getProjectTheme = async (themeId) => {
  const { data, error } = await supabase
    .from('project_themes')
    .select('*')
    .eq('id', themeId)
    .single();

  if (error) {
    console.error('Error fetching theme:', error);
    return null;
  }

  return data;
};

/**
 * Create a new project theme
 * @param {string} userId - User ID
 * @param {Object} themeData - Theme data
 * @param {string} themeData.name - Theme name
 * @param {string} themeData.color - Optional color (hex code)
 * @returns {Promise<Object>} Created theme
 */
export const createProjectTheme = async (userId, themeData) => {
  const { data, error } = await supabase
    .from('project_themes')
    .insert({
      user_id: userId,
      name: themeData.name,
      color: themeData.color || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating theme:', error);
    if (error.code === '23505') {
      throw new Error('Téma s tímto názvem již existuje.');
    }
    throw new Error('Nepodařilo se vytvořit téma.');
  }

  return data;
};

/**
 * Update a project theme
 * @param {string} themeId - Theme ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated theme
 */
export const updateProjectTheme = async (themeId, updates) => {
  const { data, error } = await supabase
    .from('project_themes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', themeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating theme:', error);
    if (error.code === '23505') {
      throw new Error('Téma s tímto názvem již existuje.');
    }
    throw new Error('Nepodařilo se aktualizovat téma.');
  }

  return data;
};

/**
 * Delete a project theme
 * @param {string} themeId - Theme ID
 * @returns {Promise<void>}
 */
export const deleteProjectTheme = async (themeId) => {
  const { error } = await supabase
    .from('project_themes')
    .delete()
    .eq('id', themeId);

  if (error) {
    console.error('Error deleting theme:', error);
    throw new Error('Nepodařilo se smazat téma.');
  }
};
