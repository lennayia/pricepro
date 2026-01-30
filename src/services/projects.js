import { supabase } from './supabase';

/**
 * Get all projects for a user (excluding archived by default)
 * @param {string} userId - User ID
 * @param {boolean} includeArchived - Whether to include archived projects
 * @param {boolean} includeEnded - Whether to include projects with status completed/cancelled
 * @returns {Promise<Array>} Array of project objects with theme details
 */
export const getProjects = async (userId, includeArchived = false, includeEnded = true) => {
  let query = supabase
    .from('projects')
    .select(`
      *,
      theme:project_themes(id, name, color)
    `)
    .eq('user_id', userId);

  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  if (!includeEnded) {
    query = query.in('status', ['active', 'paused']);
  }

  const { data, error} = await query.order('name', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Nepodařilo se načíst projekty.');
  }

  return data || [];
};

/**
 * Get a single project by ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Object|null>} Project object or null
 */
export const getProject = async (projectId) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return data;
};

/**
 * Create a new project
 * @param {string} userId - User ID
 * @param {Object} projectData - Project data
 * @param {string} projectData.name - Project name
 * @param {string} projectData.color - Optional color (hex code)
 * @param {string} projectData.type - Optional type: billable/scalable/other
 * @param {string} projectData.theme_id - Optional theme ID
 * @param {string} projectData.status - Optional status: active/paused/completed/cancelled
 * @param {string} projectData.start_date - Optional start date
 * @param {string} projectData.end_date - Optional end date
 * @returns {Promise<Object>} Created project
 */
export const createProject = async (userId, projectData) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: projectData.name,
      color: projectData.color || null,
      type: projectData.type || 'other',
      theme_id: projectData.theme_id || null,
      status: projectData.status || 'active',
      start_date: projectData.start_date || null,
      end_date: projectData.end_date || null,
      is_archived: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Projekt s tímto názvem již existuje.');
    }
    throw new Error('Nepodařilo se vytvořit projekt.');
  }

  return data;
};

/**
 * Update a project
 * @param {string} projectId - Project ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated project
 */
export const updateProject = async (projectId, updates) => {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    if (error.code === '23505') {
      throw new Error('Projekt s tímto názvem již existuje.');
    }
    throw new Error('Nepodařilo se aktualizovat projekt.');
  }

  return data;
};

/**
 * Delete a project
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
export const deleteProject = async (projectId) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error);
    throw new Error('Nepodařilo se smazat projekt.');
  }
};

/**
 * Archive a project (soft delete)
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Updated project
 */
export const archiveProject = async (projectId) => {
  return updateProject(projectId, { is_archived: true });
};

/**
 * Unarchive a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Updated project
 */
export const unarchiveProject = async (projectId) => {
  return updateProject(projectId, { is_archived: false });
};

/**
 * Upload project logo
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {File} file - Logo image file (max 50KB, max 50x50px)
 * @returns {Promise<string>} Public URL of uploaded logo
 */
export const uploadProjectLogo = async (userId, projectId, file) => {
  try {
    // Validate file size (max 50KB)
    if (file.size > 50 * 1024) {
      throw new Error('Logo je příliš velké. Maximální velikost je 50 KB.');
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Neplatný formát. Povolené formáty: PNG, JPG, WEBP, HEIC.');
    }

    // Validate image dimensions (max 50x50px)
    const dimensions = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Nepodařilo se načíst obrázek.'));
      img.src = URL.createObjectURL(file);
    });

    if (dimensions.width > 50 || dimensions.height > 50) {
      throw new Error('Logo je příliš velké. Maximální rozměry jsou 50×50 px.');
    }

    // Get file extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Delete old logo if exists
    const { data: existingFiles } = await supabase.storage
      .from('project-logos')
      .list(userId, {
        search: projectId
      });

    if (existingFiles && existingFiles.length > 0) {
      await supabase.storage
        .from('project-logos')
        .remove([`${userId}/${existingFiles[0].name}`]);
    }

    // Upload new logo
    const { data, error } = await supabase.storage
      .from('project-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading logo:', error);
      throw new Error('Nepodařilo se nahrát logo.');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-logos')
      .getPublicUrl(filePath);

    // Update project with logo URL
    await updateProject(projectId, { logo_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProjectLogo:', error);
    throw error;
  }
};

/**
 * Delete project logo
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
export const deleteProjectLogo = async (userId, projectId) => {
  try {
    // Find and delete logo files
    const { data: files } = await supabase.storage
      .from('project-logos')
      .list(userId, {
        search: projectId
      });

    if (files && files.length > 0) {
      const filesToRemove = files.map(file => `${userId}/${file.name}`);
      await supabase.storage
        .from('project-logos')
        .remove(filesToRemove);
    }

    // Update project to remove logo URL
    await updateProject(projectId, { logo_url: null });
  } catch (error) {
    console.error('Error deleting project logo:', error);
    throw new Error('Nepodařilo se smazat logo.');
  }
};
