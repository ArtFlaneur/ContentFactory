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

  async incrementGenerationCount(userId: string) {
    // This is a bit naive for client-side, ideally done via RPC or server-side
    // But for MVP it works.
    const { data: profile } = await supabase
      .from('profiles')
      .select('generation_count')
      .eq('id', userId)
      .single();
    
    if (profile) {
      const { error } = await supabase
        .from('profiles')
        .update({ generation_count: (profile.generation_count || 0) + 1 })
        .eq('id', userId);
        
      if (error) throw error;
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
