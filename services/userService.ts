import { supabase } from './supabaseClient';
import { UserProfile, UserSettings } from '../types';

export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      isPro: data.is_pro,
      generationCount: data.generation_count,
      onboardingCompleted: data.onboarding_completed,
      settings: data.settings as UserSettings
    };
  },

  async updateSettings(userId: string, settings: UserSettings) {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        settings, 
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  },

  async incrementGenerationCount(userId: string): Promise<boolean> {
    return this.addGenerations(userId, 1);
  },

  async syncGuestGenerations(userId: string, guestCount: number): Promise<boolean> {
    if (guestCount <= 0) return true;
    return this.addGenerations(userId, guestCount);
  },

  async addGenerations(userId: string, amount: number): Promise<boolean> {
    try {
      // Try RPC first (atomic increment)
      const { error: rpcError } = await supabase.rpc('increment_generation_count', { row_id: userId, amount });
      
      if (!rpcError) return true;

      console.warn('RPC increment failed, falling back to client-side update:', rpcError.message);
      
      // Fallback to client-side update
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('generation_count')
        .eq('id', userId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching profile for increment:', fetchError);
        return false;
      }
      
      if (profile) {
        const newTotal = (profile.generation_count || 0) + amount;
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ generation_count: newTotal })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating generation count:', updateError);
          return false;
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Unexpected error in addGenerations:', err);
      return false;
    }
  },

  async upgradeToPro(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', userId);

    if (error) throw error;
  }
};
