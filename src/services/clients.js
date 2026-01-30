import { supabase } from './supabase';

/**
 * Get all clients for a user
 * @param {string} userId - User ID
 * @param {boolean} includeEnded - Whether to include clients with end_date set
 * @returns {Promise<Array>} Array of client objects
 */
export const getClients = async (userId, includeEnded = true) => {
  let query = supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId);

  if (!includeEnded) {
    query = query.is('end_date', null);
  }

  const { data, error } = await query.order('name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    throw new Error('Nepodařilo se načíst klienty.');
  }

  return data || [];
};

/**
 * Get a single client by ID
 * @param {string} clientId - Client ID
 * @returns {Promise<Object|null>} Client object or null
 */
export const getClient = async (clientId) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return null;
  }

  return data;
};

/**
 * Create a new client
 * @param {string} userId - User ID
 * @param {Object} clientData - Client data
 * @param {string} clientData.name - Client name
 * @param {string} clientData.color - Optional color (hex code)
 * @param {string} clientData.start_date - Optional start date
 * @param {string} clientData.end_date - Optional end date
 * @param {string} clientData.notes - Optional notes
 * @returns {Promise<Object>} Created client
 */
export const createClient = async (userId, clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: userId,
      name: clientData.name,
      color: clientData.color || null,
      start_date: clientData.start_date || null,
      end_date: clientData.end_date || null,
      notes: clientData.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    if (error.code === '23505') {
      throw new Error('Klient s tímto názvem již existuje.');
    }
    throw new Error('Nepodařilo se vytvořit klienta.');
  }

  return data;
};

/**
 * Update a client
 * @param {string} clientId - Client ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated client
 */
export const updateClient = async (clientId, updates) => {
  const { data, error } = await supabase
    .from('clients')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clientId)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    if (error.code === '23505') {
      throw new Error('Klient s tímto názvem již existuje.');
    }
    throw new Error('Nepodařilo se aktualizovat klienta.');
  }

  return data;
};

/**
 * Delete a client
 * @param {string} clientId - Client ID
 * @returns {Promise<void>}
 */
export const deleteClient = async (clientId) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);

  if (error) {
    console.error('Error deleting client:', error);
    throw new Error('Nepodařilo se smazat klienta.');
  }
};

/**
 * Upload client logo
 * @param {string} userId - User ID
 * @param {string} clientId - Client ID
 * @param {File} file - Logo image file (max 50KB, max 50x50px)
 * @returns {Promise<string>} Public URL of uploaded logo
 */
export const uploadClientLogo = async (userId, clientId, file) => {
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
    const fileName = `${clientId}.${fileExt}`;
    const filePath = `clients/${userId}/${fileName}`;

    // Delete old logo if exists
    const { data: existingFiles } = await supabase.storage
      .from('project-logos')
      .list(`clients/${userId}`, {
        search: clientId
      });

    if (existingFiles && existingFiles.length > 0) {
      await supabase.storage
        .from('project-logos')
        .remove([`clients/${userId}/${existingFiles[0].name}`]);
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

    // Update client with logo URL
    await updateClient(clientId, { logo_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadClientLogo:', error);
    throw error;
  }
};

/**
 * Delete client logo
 * @param {string} userId - User ID
 * @param {string} clientId - Client ID
 * @returns {Promise<void>}
 */
export const deleteClientLogo = async (userId, clientId) => {
  try {
    // Find and delete logo files
    const { data: files } = await supabase.storage
      .from('project-logos')
      .list(`clients/${userId}`, {
        search: clientId
      });

    if (files && files.length > 0) {
      const filesToRemove = files.map(file => `clients/${userId}/${file.name}`);
      await supabase.storage
        .from('project-logos')
        .remove(filesToRemove);
    }

    // Update client to remove logo URL
    await updateClient(clientId, { logo_url: null });
  } catch (error) {
    console.error('Error deleting client logo:', error);
    throw new Error('Nepodařilo se smazat logo.');
  }
};
