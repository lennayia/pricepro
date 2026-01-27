/**
 * Calculator Results Service
 * Handles CRUD operations for pricing calculator results in Supabase
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Save calculator result to database
 * @param {string} userId - User ID from auth
 * @param {Object} data - Calculator result data
 * @param {number} data.minimumMonthly - Minimum monthly income
 * @param {number} data.monthlyBillableHours - Monthly billable hours
 * @param {number} data.minimumHourly - Minimum hourly rate
 * @param {number} data.recommendedHourly - Recommended hourly rate
 * @param {number} data.premiumHourly - Premium hourly rate
 * @param {number} data.coefficients - Market value coefficients
 * @param {Object} data.inputs - User input values
 * @returns {Promise<Object>} Saved calculator result
 */
export const saveCalculatorResult = async (userId, data) => {
  const { data: result, error } = await supabase
    .from('calculator_results')
    .insert([
      {
        user_id: userId,
        minimum_monthly: data.minimumMonthly,
        monthly_billable_hours: data.monthlyBillableHours,
        minimum_hourly: data.minimumHourly,
        recommended_hourly: data.recommendedHourly,
        premium_hourly: data.premiumHourly,
        coefficients: data.coefficients,
        inputs: data.inputs,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving calculator result:', error);
    throw new Error('Nepodařilo se uložit výsledek kalkulace.');
  }

  return result;
};

/**
 * Get all calculator results for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of calculator results
 */
export const getCalculatorResults = async (userId) => {
  const { data, error } = await supabase
    .from('calculator_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching calculator results:', error);
    throw new Error('Nepodařilo se načíst historii kalkulací.');
  }

  return data || [];
};

/**
 * Get latest calculator result for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Latest calculator result or null
 */
export const getLatestCalculatorResult = async (userId) => {
  const { data, error } = await supabase
    .from('calculator_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // No results found is not an error
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching latest calculator result:', error);
    throw new Error('Nepodařilo se načíst poslední kalkulaci.');
  }

  return data;
};

/**
 * Get specific calculator result by ID
 * @param {string} resultId - Result ID
 * @returns {Promise<Object>} Calculator result
 */
export const getCalculatorResult = async (resultId) => {
  const { data, error } = await supabase
    .from('calculator_results')
    .select('*')
    .eq('id', resultId)
    .single();

  if (error) {
    console.error('Error fetching calculator result:', error);
    throw new Error('Nepodařilo se načíst kalkulaci.');
  }

  return data;
};

/**
 * Delete calculator result
 * @param {string} resultId - Result ID
 * @returns {Promise<void>}
 */
export const deleteCalculatorResult = async (resultId) => {
  const { error } = await supabase
    .from('calculator_results')
    .delete()
    .eq('id', resultId);

  if (error) {
    console.error('Error deleting calculator result:', error);
    throw new Error('Nepodařilo se smazat kalkulaci.');
  }
};

/**
 * Update calculator result
 * @param {string} resultId - Result ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated calculator result
 */
export const updateCalculatorResult = async (resultId, data) => {
  const updateData = {};

  if (data.minimumMonthly !== undefined) updateData.minimum_monthly = data.minimumMonthly;
  if (data.monthlyBillableHours !== undefined) updateData.monthly_billable_hours = data.monthlyBillableHours;
  if (data.minimumHourly !== undefined) updateData.minimum_hourly = data.minimumHourly;
  if (data.recommendedHourly !== undefined) updateData.recommended_hourly = data.recommendedHourly;
  if (data.premiumHourly !== undefined) updateData.premium_hourly = data.premiumHourly;
  if (data.coefficients !== undefined) updateData.coefficients = data.coefficients;
  if (data.inputs !== undefined) updateData.inputs = data.inputs;

  const { data: result, error } = await supabase
    .from('calculator_results')
    .update(updateData)
    .eq('id', resultId)
    .select()
    .single();

  if (error) {
    console.error('Error updating calculator result:', error);
    throw new Error('Nepodařilo se aktualizovat kalkulaci.');
  }

  return result;
};
