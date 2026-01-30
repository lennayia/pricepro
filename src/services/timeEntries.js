import { supabase } from './supabase';

/**
 * Fetch all time entries for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of time entry objects
 */
export const getTimeEntries = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching time entries:', error);
    throw new Error(`Chyba při načítání záznamů: ${error.message}`);
  }
};

/**
 * Fetch a specific time entry for a user and date
 * @param {string} userId - User ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Time entry object or null if not found
 */
export const getTimeEntry = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching time entry:', error);
    throw new Error(`Chyba při načítání záznamu: ${error.message}`);
  }
};

/**
 * Insert or update a time entry (UPSERT)
 * @param {string} userId - User ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {Object} data - Time entry data
 * @param {number} data.client_communication - Hours spent on client communication
 * @param {number} data.content_creation - Hours spent on content creation
 * @param {number} data.social_media - Hours spent on social media
 * @param {number} data.administration - Hours spent on administration
 * @param {number} data.messages - Hours spent on messages
 * @param {number} data.education - Hours spent on education
 * @param {number} data.billable_work - Hours spent on billable work
 * @param {number} data.digital_products - Hours spent on creating digital products
 * @param {number} data.other - Hours spent on other activities
 * @param {number} data.sleep - Hours spent sleeping
 * @param {number} data.family_time - Hours spent with family and friends
 * @param {number} data.personal_time - Hours spent on personal activities
 * @param {string} data.project_name - Optional project/client name (deprecated, use category_projects)
 * @param {Object} data.category_projects - Optional mapping of category keys to project IDs
 * @param {Object} data.category_project_hours - Optional mapping of category keys to project hours breakdown
 * @returns {Promise<Object>} Saved time entry object
 */
export const upsertTimeEntry = async (userId, date, data) => {
  try {
    // Prepare entry data
    const entryData = {
      user_id: userId,
      date: date,
      client_communication: data.client_communication || 0,
      content_creation: data.content_creation || 0,
      social_media: data.social_media || 0,
      administration: data.administration || 0,
      messages: data.messages || 0,
      education: data.education || 0,
      billable_work: data.billable_work || 0,
      digital_products: data.digital_products || 0,
      other: data.other || 0,
      sleep: data.sleep || 0,
      family_time: data.family_time || 0,
      personal_time: data.personal_time || 0,
      project_name: data.project_name || null, // Keep for backward compatibility
      category_projects: data.category_projects || {},
      category_project_hours: data.category_project_hours || {},
      category_project_clients: data.category_project_clients || {},
      client_id: data.client_id || null,
      updated_at: new Date().toISOString()
    };

    // Use upsert to insert or update
    const { data: savedData, error } = await supabase
      .from('time_entries')
      .upsert(entryData, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return savedData;
  } catch (error) {
    console.error('Error saving time entry:', error);
    throw new Error(`Chyba při ukládání záznamu: ${error.message}`);
  }
};

/**
 * Delete a time entry
 * @param {string} userId - User ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<void>}
 */
export const deleteTimeEntry = async (userId, date) => {
  try {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting time entry:', error);
    throw new Error(`Chyba při mazání záznamu: ${error.message}`);
  }
};

/**
 * Get time entries for a specific date range
 * @param {string} userId - User ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of time entry objects
 */
export const getTimeEntriesInRange = async (userId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching time entries in range:', error);
    throw new Error(`Chyba při načítání záznamů: ${error.message}`);
  }
};

/**
 * Get unique project names for user (for autocomplete)
 * @param {string} userId - User ID
 * @returns {Promise<Array<string>>} Array of unique project names
 */
export const getUserProjects = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('project_name')
      .eq('user_id', userId)
      .not('project_name', 'is', null)
      .order('project_name', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    // Get unique project names
    const projects = [...new Set(data.map(e => e.project_name))];
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};
