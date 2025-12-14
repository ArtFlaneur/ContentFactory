/// <reference path="../vite-env.d.ts" />

import { createClient } from '@supabase/supabase-js';

declare global {
  interface ImportMeta {
    readonly env: Record<string, any>;
  }
}

// These environment variables need to be set in your .env.local file
const meta: any = import.meta;
const env = meta?.env as Record<string, string | undefined> | undefined;
const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseHost = (() => {
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).host;
  } catch {
    return null;
  }
})();

const authStorage = (() => {
  if (typeof window === 'undefined') return undefined;

  const safe = {
    getItem(key: string) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        try {
          return window.sessionStorage.getItem(key);
        } catch {
          return null;
        }
      }
    },
    setItem(key: string, value: string) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        try {
          window.sessionStorage.setItem(key, value);
        } catch {
          // ignore
        }
      }
    },
    removeItem(key: string) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  };

  // Quick probe to see if localStorage is writable; if not, we'll still use the adapter.
  try {
    const probeKey = '__cf_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
  } catch {
    // noop
  }

  return safe;
})();

if (!isSupabaseConfigured) {
  console.warn('Missing Supabase environment variables. Database features will not work.');
}

const makeUnconfiguredSupabaseStub = () => {
  const fail = () => {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: fail() }),
      signUp: async () => ({ data: { user: null, session: null }, error: fail() }),
      resetPasswordForEmail: async () => ({ data: {}, error: fail() })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => fail() }) }),
      upsert: async () => fail(),
      update: () => ({ eq: async () => fail() })
    }),
    rpc: async () => fail()
  } as any;
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: authStorage
      }
    })
  : makeUnconfiguredSupabaseStub();
