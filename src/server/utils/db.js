import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not found. Database features will be disabled.');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Database helper functions
export const db = {
  // Users
  async getUserById(userId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUser(userData) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateUser(userId, updates) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Scores
  async getLeaderboard(gameId, limit = 100) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('scores')
      .select(`
        *,
        users (username, avatar)
      `)
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async submitScore(scoreData) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('scores')
      .insert([scoreData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getUserBestScore(userId, gameId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Achievements
  async getUserAchievements(userId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async unlockAchievement(userId, achievementId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Game saves
  async getSave(userId, gameId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('game_saves')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsertSave(userId, gameId, saveData) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('game_saves')
      .upsert({
        user_id: userId,
        game_id: gameId,
        save_data: saveData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSave(userId, gameId) {
    if (!supabase) return null;
    const { error } = await supabase
      .from('game_saves')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId);
    if (error) throw error;
    return true;
  },

  // Games
  async getAllGames() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getGameById(gameId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Stats
  async getUserStats(userId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .rpc('get_user_stats', { user_id_param: userId });
    if (error) throw error;
    return data;
  }
};

export default db;
