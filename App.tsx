import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { GeneratedPost } from './components/GeneratedPost';
import { OnboardingWizard } from './components/OnboardingWizard';
import { PaymentModal } from './components/PaymentModal';
import { HistoryPanel } from './components/HistoryPanel';
import { OrganizationProfilePanel } from './components/OrganizationProfilePanel';
import { SharePreview, SharePreviewError } from './components/SharePreview';
import { HistoryItem, HistoryRequestSnapshot, OrganizationInfo, PostRequest, GeneratedPost as GeneratedPostType, SharePayload, UserSettings } from './types';
import { generateLinkedInPost } from './services/deepseekService';
import { userService } from './services/userService';
import { supabase } from './services/supabaseClient';
import { storage } from './services/storage';
import { decodeSharePayload } from './services/shareLink';
import { Factory, Settings, Zap, Clock, LogOut } from 'lucide-react';

declare const __HAS_DEEPSEEK_KEY__: boolean;
const hasConfiguredApiKey = __HAS_DEEPSEEK_KEY__;

const Footer = () => (
  <footer className="py-6 text-center text-sm text-slate-600 bg-white border-t-2 border-black">
    <p>
      For any questions, please contact{' '}
      <a href="mailto:info@artflaneur.com.au" className="text-indigo-700 hover:underline">
        info@artflaneur.com.au
      </a>
    </p>
    <p className="mt-1 text-xs text-slate-500">
      Disclaimer: Generated content may contain errors. Please review before publishing.
    </p>
  </footer>
);

const App: React.FC = () => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hasSyncedGuestForUserRef = React.useRef<string | null>(null);
  const hasAppliedPendingOnboardingForUserRef = React.useRef<string | null>(null);
  const hydrationKeyRef = React.useRef<string | null>(null);
  const hydrationInFlightRef = React.useRef<Promise<void> | null>(null);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    let timeoutId: number | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  const getUserGenerationKey = (uid: string) => `user_generation_count_${uid}`;
  
  // Initialize generation count from localStorage for guests, or 0
  const [generationCount, setGenerationCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = storage.getItem('guest_generation_count');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [currentPost, setCurrentPost] = useState<GeneratedPostType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generationStatusTimerRef = React.useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const { payload: sharePayload, error: shareError } = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return { payload: null as SharePayload | null, error: null as string | null };
    }
    const params = new URLSearchParams(window.location.search);
    const token = params.get('share');
    if (!token) {
      return { payload: null as SharePayload | null, error: null as string | null };
    }
    const decoded = decodeSharePayload(token);
    if (!decoded) {
      return {
        payload: null as SharePayload | null,
        error: 'This share link is invalid or has expired.'
      };
    }
    return { payload: decoded, error: null as string | null };
  }, []);

  const isShareMode = Boolean(sharePayload);

  const exitShareMode = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('share');
    const search = url.searchParams.toString();
    const next = `${url.origin}${url.pathname}${search ? `?${search}` : ''}${url.hash}`;
    window.location.replace(next);
  }, []);

  const FREE_LIMIT = 3;

  const getHistoryKey = (uid: string | null) => `cf_history_${uid || 'anon'}`;

  const loadHistory = React.useCallback((uid: string | null) => {
    try {
      const raw = storage.getItem(getHistoryKey(uid));
      if (!raw) return [] as HistoryItem[];
      const parsed = JSON.parse(raw) as HistoryItem[];
      return Array.isArray(parsed) ? parsed : ([] as HistoryItem[]);
    } catch {
      return [] as HistoryItem[];
    }
  }, []);

  const saveHistory = React.useCallback((uid: string | null, items: HistoryItem[]) => {
    try {
      storage.setItem(getHistoryKey(uid), JSON.stringify(items));
    } catch {
      // ignore
    }
  }, []);


  React.useEffect(() => {
    if (isShareMode) return;
    let cancelled = false;

    // Guest history stays local.
    if (!userId) {
      setHistoryItems(loadHistory(null));
      return;
    }

    // Logged-in history is loaded from Supabase (and cached locally as a fallback).
    void (async () => {
      const remote = await userService.listHistory(userId, 50);
      if (cancelled) return;
      if (remote && remote.length > 0) {
        setHistoryItems(remote);
        saveHistory(userId, remote);
      } else {
        // Fallback to local cache if DB is empty/unavailable.
        setHistoryItems(loadHistory(userId));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, loadHistory, saveHistory, isShareMode]);

  

  // Hydrate user session + profile on startup and on auth changes.
  React.useEffect(() => {
    if (isShareMode) return;
    let cancelled = false;

    const hydrate = async (session: any, reason: string) => {
      const uid = session?.user?.id || null;
      const key = uid ? `${uid}` : 'anon';

      // Deduplicate back-to-back INITIAL_SESSION + BOOTSTRAP / SIGNED_IN
      const compositeKey = `${reason}:${key}`;
      if (hydrationKeyRef.current === compositeKey) return;
      hydrationKeyRef.current = compositeKey;

      // Ensure only one hydration runs at a time.
      if (hydrationInFlightRef.current) {
        await hydrationInFlightRef.current;
        if (cancelled) return;
      }

      hydrationInFlightRef.current = (async () => {
        try {
          if (!uid) {
            setUserId(null);
            setUserSettings(null);
            setIsPro(false);
            hasSyncedGuestForUserRef.current = null;

            const saved = storage.getItem('guest_generation_count');
            setGenerationCount(saved ? parseInt(saved, 10) : 0);
            return;
          }

          setUserId(uid);
          const ensured = await userService.ensureProfile(uid, session?.user?.email || undefined);
          if (!ensured) {
            setError('Could not create/update your profile in Supabase. Check RLS INSERT/UPDATE policies on the profiles table.');
          }

          // Sync guest generations first (so DB count reflects them on refresh).
          const guestCount = parseInt(storage.getItem('guest_generation_count') || '0', 10);
          const shouldSyncGuest =
            guestCount > 0 &&
            hasSyncedGuestForUserRef.current !== uid;

          if (shouldSyncGuest) {
            hasSyncedGuestForUserRef.current = uid;
            const success = await userService.syncGuestGenerations(uid, guestCount);
            if (success) {
              storage.removeItem('guest_generation_count');
            } else {
              // Allow retry later in this session
              hasSyncedGuestForUserRef.current = null;
            }
          }

          const [profile, dbGenCount] = await Promise.all([
            userService.getProfile(uid),
            userService.getGenerationCount(uid)
          ]);

          // If email confirmation is enabled, the initial signup happens without a session,
          // so we can't write settings to `profiles` until the user confirms and logs in.
          // In that case we store onboarding settings locally and apply them here once signed in.
          if (!profile?.onboardingCompleted && hasAppliedPendingOnboardingForUserRef.current !== uid) {
            // First preference: settings saved server-side in auth user metadata at sign-up time.
            // This survives email confirmation flows and works even if localStorage is cleared.
            const metadataSettings = session?.user?.user_metadata?.cf_onboarding_settings;
            if (metadataSettings && typeof metadataSettings === 'object') {
              try {
                const pending = metadataSettings as UserSettings;
                const isMeaningful = Boolean(pending?.industry || pending?.role || pending?.country || pending?.city);
                if (isMeaningful) {
                  try {
                    await userService.updateSettings(uid, pending);
                    hasAppliedPendingOnboardingForUserRef.current = uid;
                  } catch (applyErr) {
                    console.error('Failed to apply onboarding settings from user metadata:', applyErr);
                    setError('Could not save your onboarding settings to Supabase. Check RLS UPDATE policy on the profiles table.');
                  }
                }
              } catch {
                // ignore
              }

              // If we successfully applied settings, skip localStorage fallback.
              if (hasAppliedPendingOnboardingForUserRef.current === uid) {
                // continue hydration
              } else {
                // fall through to localStorage keys
              }
            }

            const emailRaw = session?.user?.email;
            const emailTrimmed = typeof emailRaw === 'string' ? emailRaw.trim() : '';
            const emailNormalized = emailTrimmed.toLowerCase();

            const candidateKeys = [
              emailNormalized ? `pending_onboarding_settings_${encodeURIComponent(emailNormalized)}` : null,
              emailTrimmed ? `pending_onboarding_settings_${encodeURIComponent(emailTrimmed)}` : null,
            ].filter(Boolean) as string[];

            for (const key of candidateKeys) {
              const pendingRaw = storage.getItem(key);
              if (!pendingRaw) continue;
              try {
                const pending = JSON.parse(pendingRaw) as UserSettings;
                const isMeaningful = Boolean(pending?.industry || pending?.role || pending?.country || pending?.city);
                if (isMeaningful) {
                    try {
                      await userService.updateSettings(uid, pending);
                      hasAppliedPendingOnboardingForUserRef.current = uid;
                    } catch (applyErr) {
                      console.error('Failed to apply pending onboarding settings:', applyErr);
                      setError('Could not save your onboarding settings to Supabase. Check RLS UPDATE policy on the profiles table.');
                    }
                }
              } catch {
                // ignore
              } finally {
                // Remove whatever key we found to avoid retry loops.
                storage.removeItem(key);
              }
              break;
            }
          }

          if (dbGenCount === null && !profile) {
            setError('Could not load your profile/usage from Supabase. Check RLS SELECT policies on the profiles table.');
          }

          // If we applied pending onboarding settings, re-fetch to ensure we use the persisted copy.
          const effectiveProfile = (hasAppliedPendingOnboardingForUserRef.current === uid)
            ? (await userService.getProfile(uid))
            : profile;

          setIsPro(Boolean(effectiveProfile?.isPro));

          const localUserCount = parseInt(storage.getItem(getUserGenerationKey(uid)) || '0', 10);
          const dbCount = (dbGenCount ?? effectiveProfile?.generationCount ?? 0) as number;
          const effectiveCount = Math.max(dbCount, localUserCount);
          setGenerationCount(effectiveCount);

          if (effectiveProfile?.onboardingCompleted) {
            let effectiveSettings = effectiveProfile.settings;
            try {
              const cached = storage.getItem(`user_settings_${uid}`);
              if (cached) {
                const parsed = JSON.parse(cached) as UserSettings;
                if (!effectiveSettings?.industry && parsed) effectiveSettings = parsed;
              }
            } catch {
              // ignore
            }

            setUserSettings(effectiveSettings);
            try {
              storage.setItem(`user_settings_${uid}`, JSON.stringify(effectiveSettings));
            } catch {
              // ignore
            }
          } else {
            setUserSettings(null);
          }

          // If local backup is ahead of DB, reconcile the delta (covers failed RPC or offline usage)
          if (localUserCount > dbCount) {
            const delta = localUserCount - dbCount;
            const reconciled = await userService.addGenerations(uid, delta);
            if (reconciled) {
              const refreshed = await userService.getProfile(uid);
              const newDbCount = refreshed?.generationCount || localUserCount;
              setGenerationCount(Math.max(newDbCount, localUserCount));
            }
          }
        } catch (err) {
          console.error('Hydration failed:', err);
          setError((err as any)?.message || 'Could not load your account from Supabase.');
        } finally {
          setIsAuthInitializing(false);
        }
      })();

      await hydrationInFlightRef.current;
      hydrationInFlightRef.current = null;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore the initial event if getSession() already hydrated.
      void hydrate(session, event);
    });

    // Bootstrap once on mount.
    void (async () => {
      try {
        // If Supabase redirected back with a PKCE code (common for email confirmation links),
        // exchange it for a session explicitly to avoid landing in a "logged out" state.
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(window.location.href);
          } catch (exchangeErr) {
            console.error('Failed to exchange auth code for session:', exchangeErr);
          } finally {
            params.delete('code');
            const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash || ''}`;
            window.history.replaceState({}, '', next);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!cancelled) await hydrate(session, 'BOOTSTRAP');
      } catch {
        if (!cancelled) setIsAuthInitializing(false);
      }
    })();

    // Fallback: don't get stuck on Loading if Supabase calls stall
    const initTimeout = window.setTimeout(() => {
      setIsAuthInitializing(false);
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [isShareMode]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      setIsEditingSettings(false);
      setIsPaymentModalOpen(false);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      console.error('Logout failed:', err);
      setError(err?.message || 'Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleGenerate = async (request: PostRequest) => {
    if (generationCount >= FREE_LIMIT && !isPro) {
      setIsPaymentModalOpen(true);
      return;
    }

    // Ensure the user sees progress/output (not the history list) while generating.
    setActiveTab('generate');

    // Show a visible progress/status in the output panel while waiting for the model.
    if (generationStatusTimerRef.current) {
      window.clearInterval(generationStatusTimerRef.current);
      generationStatusTimerRef.current = null;
    }

    const statusSteps = request.includeNews
      ? [
          'Validating sources…',
          'Fetching context…',
          'Extracting key facts…',
          'Building your outline…',
          'Drafting the hook…',
          'Writing the full post…',
          'Tightening the CTA…',
          'Formatting platform versions…',
          'Running a quality pass…',
          'Packaging the result…',
          'Almost there…'
        ]
      : [
          'Building your outline…',
          'Drafting the hook…',
          'Writing the full post…',
          'Tightening transitions…',
          'Tightening the CTA…',
          'Formatting platform versions…',
          'Running a quality pass…',
          'Packaging the result…',
          'Almost there…'
        ];

    setGenerationStatus(statusSteps[0]);
    let stepIndex = 0;
    generationStatusTimerRef.current = window.setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, statusSteps.length - 1);
      setGenerationStatus(statusSteps[stepIndex]);
    }, 2400);

    // Inject User Context from Onboarding
    const enrichedRequest = {
      ...request,
      platforms: userSettings?.primaryPlatforms,
      userContext: userSettings ? {
        industry: userSettings.industry,
        role: userSettings.role,
        country: userSettings.country,
        city: userSettings.city,
        targetAudience: request.audience // Use the selected audience
      } : undefined,
      organizationInfo: userSettings?.organizationInfo // Pass organization info for press releases
    };

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateLinkedInPost(enrichedRequest);
      setCurrentPost(result);

      // Persist to history
      const requestSnapshot: HistoryRequestSnapshot = {
        topic: request.topic,
        audience: request.audience,
        category: request.category,
        goal: request.goal,
        tone: request.tone,
        language: request.language,
        frameworkId: request.frameworkId,
        includeNews: Boolean(request.includeNews),
        sourceUrls: request.sourceUrls && request.sourceUrls.length > 0
          ? [...request.sourceUrls]
          : undefined
      };


      const historyPayload = {
        request: requestSnapshot,
        post: result
      };

      if (userId) {
        // Prefer Supabase for logged-in users (cross-device).
        const saved = await userService.addHistoryItem(userId, historyPayload);
        if (saved) {
          setHistoryItems((prev) => {
            const next = [saved, ...(prev || [])].slice(0, 50);
            saveHistory(userId, next);
            return next;
          });
        } else {
          // Fallback to local cache
          const fallbackItem: HistoryItem = {
            id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
            createdAt: Date.now(),
            request: historyPayload.request,
            post: historyPayload.post
          };
          setHistoryItems((prev) => {
            const next = [fallbackItem, ...(prev || [])].slice(0, 50);
            saveHistory(userId, next);
            return next;
          });
        }
      } else {
        // Guest: local-only.
        const newItem: HistoryItem = {
          id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
          createdAt: Date.now(),
          request: historyPayload.request,
          post: historyPayload.post
        };
        setHistoryItems((prev) => {
          const next = [newItem, ...(prev || [])].slice(0, 50);
          saveHistory(null, next);
          return next;
        });
      }
      
      // Update count
      setGenerationCount(prev => {
        const newCount = prev + 1;
        // If guest, save to local storage
        if (!userId) {
          storage.setItem('guest_generation_count', newCount.toString());
        } else {
          // Logged-in backup (prevents count “reset” if DB increment fails)
          storage.setItem(getUserGenerationKey(userId), newCount.toString());
        }
        return newCount;
      });

      // Persist generation count to DB in the background.
      // This must NOT block the UI (otherwise the Generate button can get stuck on "Generating...").
      void (async () => {
        try {
          const { data: { user } } = await withTimeout(supabase.auth.getUser(), 2500, 'supabase.auth.getUser');
          const effectiveUserId = user?.id || userId;
          if (!effectiveUserId) return;

          // Ensure local backup is keyed to the actual authed user
          const currentLocal = parseInt(storage.getItem(getUserGenerationKey(effectiveUserId)) || '0', 10);
          storage.setItem(getUserGenerationKey(effectiveUserId), Math.max(currentLocal, generationCount + 1).toString());

          const ok = await withTimeout(userService.incrementGenerationCount(effectiveUserId), 4000, 'userService.incrementGenerationCount');
          if (!ok) {
            console.error('Failed to persist generation count to DB; kept local backup.');
          }
        } catch (persistErr) {
          console.error('Background persistence failed:', persistErr);
        }
      })();
    } catch (err: any) {
      setError(err.message || "Something went wrong generating the post.");
    } finally {
      setIsLoading(false);

      if (generationStatusTimerRef.current) {
        window.clearInterval(generationStatusTimerRef.current);
        generationStatusTimerRef.current = null;
      }
      setGenerationStatus(null);
    }
  };

  const handleReset = () => {
      setCurrentPost(null);
      setError(null);

      if (generationStatusTimerRef.current) {
        window.clearInterval(generationStatusTimerRef.current);
        generationStatusTimerRef.current = null;
      }
      setGenerationStatus(null);
  };

  const handleOrganizationSave = React.useCallback(async (nextInfo?: OrganizationInfo) => {
    if (!userSettings) return;
    const previousSettings = userSettings;
    const updatedSettings: UserSettings = { ...userSettings };

    if (nextInfo) {
      updatedSettings.organizationInfo = nextInfo;
    } else {
      delete (updatedSettings as Partial<UserSettings>).organizationInfo;
    }

    setUserSettings(updatedSettings);

    try {
      if (userId) {
        await userService.updateSettings(userId, updatedSettings);
        try {
          storage.setItem(`user_settings_${userId}`, JSON.stringify(updatedSettings));
        } catch {
          // ignore cache errors
        }
      } else {
        try {
          storage.setItem('guest_user_settings', JSON.stringify(updatedSettings));
        } catch {
          // ignore cache errors
        }
      }
    } catch (orgErr) {
      console.error('Failed to save organization info:', orgErr);
      setUserSettings(previousSettings);
      if (userId) {
        try {
          storage.setItem(`user_settings_${userId}`, JSON.stringify(previousSettings));
        } catch {
          // ignore cache errors
        }
      }
      throw orgErr;
    }
  }, [userId, userSettings]);

  // Check for payment success on mount
  React.useEffect(() => {
    if (isShareMode) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true' && userId) {
      // Stripe webhook is the source of truth for Pro upgrades.
      // Clean URL and show success; the next hydration cycle will pull `is_pro` from Supabase.
      window.history.replaceState({}, '', window.location.pathname);
      alert("🎉 Payment successful! Your Pro access will activate shortly.");
    }
  }, [userId, isShareMode]);

  const handleUpgrade = () => {
    if (!userId) return;
    
    // Pass userId as client_reference_id for future webhook matching
    const basePaymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/bJe28q0Kv4bF3fAeOr1Nu07';
    const paymentLink = `${basePaymentLink}?client_reference_id=${userId}`;
    window.location.href = paymentLink;
  };

  if (sharePayload) {
    return (
      <SharePreview
        payload={sharePayload}
        onExit={exitShareMode}
      />
    );
  }

  if (shareError) {
    return (
      <SharePreviewError
        message={shareError}
        onExit={exitShareMode}
      />
    );
  }

  if (isAuthInitializing) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-slate-500 text-sm">Loading your account…</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show onboarding for guests, explicit editing, or logged-in users who still haven't completed onboarding.
  // This prevents a "stuck" state where settings failed to persist and the user can never complete onboarding.
  if (!userId || isEditingSettings || !userSettings) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-6xl px-4">
            {error && (
              <div className="mb-4 bg-red-50 border-2 border-black rounded-none p-4 text-sm text-red-800">
                <strong>Error:</strong> {error}
              </div>
            )}
            <OnboardingWizard 
            onComplete={async (newSettings) => {
              setUserSettings(newSettings);
              setIsEditingSettings(false);
              setError(null);
              
              // If we have a user ID (either from existing session or just signed up in Wizard), save settings
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  await userService.updateSettings(session.user.id, newSettings);
                  setUserId(session.user.id);

                  // Cache settings locally (helps avoid showing onboarding on refresh if DB settings are missing)
                  try {
                    storage.setItem(`user_settings_${session.user.id}`, JSON.stringify(newSettings));
                  } catch {
                    // ignore
                  }

                  // Restore generation count from DB/local backup after onboarding save
                  const dbGenCount = await userService.getGenerationCount(session.user.id);
                  const localUserCount = parseInt(storage.getItem(getUserGenerationKey(session.user.id)) || '0', 10);
                  if (typeof dbGenCount === 'number') {
                    setGenerationCount(Math.max(dbGenCount, localUserCount));
                  } else {
                    setGenerationCount(localUserCount);
                  }
                }
              } catch (saveErr: any) {
                console.error('Failed to save onboarding settings:', saveErr);
                setError(saveErr?.message || 'Could not save onboarding settings. Check your Supabase policies.');
              }
            }} 
            initialSettings={userSettings}
            onCancel={isEditingSettings ? () => setIsEditingSettings(false) : undefined}
            userId={userId}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-indigo-100 p-2 border-2 border-black rounded-none flex items-center justify-center">
                <Factory className="text-slate-900 h-5 w-5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate max-w-[10rem] sm:max-w-none">
              Make Content
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block text-xs font-medium px-3 py-2 bg-slate-100 text-slate-700">
              {isPro ? 'Unlimited Pro Access' : `${Math.max(0, FREE_LIMIT - generationCount)} credits left`}
            </div>

            <button 
              onClick={() => setIsEditingSettings(true)}
              className="text-slate-900 transition-colors inline-flex items-center text-sm font-medium px-3 py-2 border-2 border-black rounded-none bg-indigo-50 hover:bg-indigo-100"
              aria-label="Factory Settings"
            >
              <Settings className="w-4 h-4 sm:mr-1.5" />
              <span className="sr-only">Factory Settings</span>
              <span className="hidden sm:inline">Factory Settings</span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'history' ? 'generate' : 'history')}
              className={`transition-colors inline-flex items-center text-sm font-medium px-3 py-2 border-2 border-black rounded-none text-slate-900 ${
                activeTab === 'history' ? 'bg-amber-200' : 'bg-amber-50 hover:bg-amber-100'
              }`}
              aria-label="History"
            >
              <Clock className="w-4 h-4 sm:mr-1.5" />
              <span className="sr-only">History</span>
              <span className="hidden sm:inline">History</span>
            </button>
            
            {!isPro && (
                <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-slate-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-none border-2 border-black transition-colors inline-flex items-center text-sm font-medium"
                aria-label="Upgrade"
                >
                <Zap className="w-3 h-3 sm:mr-1 fill-current" />
                <span className="sr-only">Upgrade</span>
                <span className="hidden sm:inline">Upgrade</span>
                </button>
            )}

            {userId && (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-slate-900 transition-colors inline-flex items-center text-sm font-medium px-3 py-2 border-2 border-black rounded-none bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4 sm:mr-1.5" />
                <span className="sr-only">Log Out</span>
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <PaymentModal 
            isOpen={isPaymentModalOpen} 
            onClose={() => setIsPaymentModalOpen(false)} 
            onUpgrade={handleUpgrade}
        />

        {/* API Key Warning (For Demo Purposes) */}
        {!hasConfiguredApiKey && (
             <div className="mb-6 bg-amber-50 border-2 border-black rounded-none p-4 text-sm text-amber-900 flex items-start">
                <span className="mr-2">⚠️</span>
                <span>
              <strong>Missing API Key:</strong> Configure <code>ANTHROPIC_API_KEY</code> in your server environment (.env.local) so the local proxy can authenticate requests.
                </span>
            </div>
        )}

        {error && (
           <div className="mb-6 bg-red-50 border-2 border-black rounded-none p-4 text-sm text-red-800">
                <strong>Error:</strong> {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 space-y-6">
                <InputForm 
                  onSubmit={handleGenerate} 
                  isLoading={isLoading} 
                  userSettings={userSettings}
                />
                <OrganizationProfilePanel 
                  organizationInfo={userSettings.organizationInfo}
                  onSave={handleOrganizationSave}
                />
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 xl:col-span-8">
            {activeTab === 'history' ? (
              <HistoryPanel
                items={historyItems}
                onSelect={(item) => {
                  setCurrentPost(item.post as GeneratedPostType);
                  setActiveTab('generate');
                }}
              />
            ) : (
              <GeneratedPost 
                post={currentPost} 
                isLoading={isLoading} 
                statusText={generationStatus}
                onReset={handleReset} 
                userSettings={userSettings}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;