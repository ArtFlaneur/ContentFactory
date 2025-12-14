import { supabase } from './supabaseClient';
import { PostTone, type GeneratedPost, type HistoryItem, UserProfile, UserSettings } from '../types';

const normalizeUserSettings = (raw: unknown): UserSettings => {
  const obj = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {};

  const primaryPlatforms = Array.isArray(obj.primaryPlatforms)
    ? (obj.primaryPlatforms as UserSettings['primaryPlatforms']).filter(Boolean)
    : ['linkedin'];

  const targetAudiences = Array.isArray(obj.targetAudiences)
    ? (obj.targetAudiences as string[]).slice(0, 3)
    : ['', '', ''];

  return {
    industry: typeof obj.industry === 'string' ? obj.industry : '',
    role: typeof obj.role === 'string' ? obj.role : '',
    country: typeof obj.country === 'string' ? obj.country : '',
    city: typeof obj.city === 'string' ? obj.city : '',
    targetAudiences: [targetAudiences[0] || '', targetAudiences[1] || '', targetAudiences[2] || ''],
    primaryPlatforms: (primaryPlatforms.length > 0 ? primaryPlatforms : ['linkedin']) as UserSettings['primaryPlatforms'],
    preferredTone: (Object.values(PostTone).includes(obj.preferredTone as PostTone)
      ? (obj.preferredTone as PostTone)
      : PostTone.PROFESSIONAL),
    customCTAs: Array.isArray(obj.customCTAs) ? (obj.customCTAs as string[]).filter((v) => typeof v === 'string') : [],
    isPro: typeof obj.isPro === 'boolean' ? obj.isPro : undefined
  };
};

export const userService = {
  async ensureProfile(userId: string, email?: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: email ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Error ensuring profile:', error);
      return false;
    }
    return true;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,is_pro,generation_count,onboarding_completed,settings')
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
      settings: normalizeUserSettings(data.settings)
    };
  },

  async getGenerationCount(userId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('generation_count')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching generation count:', error);
      return null;
    }

    return typeof data?.generation_count === 'number' ? data.generation_count : (data?.generation_count ?? 0);
  },

  async updateSettings(userId: string, settings: UserSettings) {
    const { isPro: _isPro, ...settingsToSave } = settings as UserSettings & { isPro?: boolean };
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          settings: settingsToSave,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

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
  ,

  async listHistory(userId: string, limit = 50): Promise<HistoryItem[]> {
    const { data, error } = await supabase
      .from('generated_posts')
      .select('id,created_at,request,post')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching generated_posts:', error);
      return [];
    }

    return (data || []).map((row: any) => {
      const createdAt = row?.created_at ? Date.parse(row.created_at) : Date.now();
      return {
        id: String(row.id),
        createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
        request: (row.request || {}) as HistoryItem['request'],
        post: (row.post || {}) as GeneratedPost
      } satisfies HistoryItem;
    });
  },

  async addHistoryItem(
    userId: string,
    payload: { request: HistoryItem['request']; post: GeneratedPost }
  ): Promise<HistoryItem | null> {
    // RLS requires user_id to match auth.uid().
    const insertRow = {
      user_id: userId,
      request: payload.request,
      post: payload.post
    };

    const { data, error } = await supabase
      .from('generated_posts')
      .insert(insertRow)
      .select('id,created_at,request,post')
      .single();

    if (error) {
      console.error('Error inserting generated_posts:', error);
      return null;
    }

    const createdAt = data?.created_at ? Date.parse((data as any).created_at) : Date.now();
    return {
      id: String((data as any).id),
      createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
      request: ((data as any).request || payload.request) as HistoryItem['request'],
      post: ((data as any).post || payload.post) as GeneratedPost
    };
  }
};
