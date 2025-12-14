import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { GeneratedPost } from './components/GeneratedPost';
import { OnboardingWizard } from './components/OnboardingWizard';
import { PaymentModal } from './components/PaymentModal';
import { PostRequest, GeneratedPost as GeneratedPostType, UserSettings } from './types';
import { generateLinkedInPost } from './services/deepseekService';
import { userService } from './services/userService';
import { supabase } from './services/supabaseClient';
import { storage } from './services/storage';
import { Factory, Settings, Zap } from 'lucide-react';

declare const __HAS_DEEPSEEK_KEY__: boolean;
const hasConfiguredApiKey = __HAS_DEEPSEEK_KEY__;

const Footer = () => (
  <footer className="py-6 text-center text-sm text-slate-500 bg-slate-50 border-t border-slate-200">
    <p>For any questions, please contact <a href="mailto:info@artflaneur.com.au" className="text-indigo-600 hover:underline">info@artflaneur.com.au</a></p>
    <p className="mt-1 text-xs text-slate-400">Disclaimer: Generated content may contain errors. Please review before publishing.</p>
  </footer>
);

const App: React.FC = () => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
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

  const FREE_LIMIT = 3;

  // Hydrate user session + profile on startup and on auth changes.
  React.useEffect(() => {
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
          await userService.ensureProfile(uid, session?.user?.email || undefined);

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
            const email = session?.user?.email;
            if (email) {
              const key = `pending_onboarding_settings_${encodeURIComponent(email)}`;
              const pendingRaw = storage.getItem(key);
              if (pendingRaw) {
                try {
                  const pending = JSON.parse(pendingRaw) as UserSettings;
                  const isMeaningful = Boolean(pending?.industry || pending?.role || pending?.country || pending?.city);
                  if (isMeaningful) {
                    await userService.updateSettings(uid, pending);
                    hasAppliedPendingOnboardingForUserRef.current = uid;
                    storage.removeItem(key);
                  }
                } catch {
                  // If parsing fails, drop the cached value to avoid retry loops.
                  storage.removeItem(key);
                }
              }
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
  }, []);

  const handleGenerate = async (request: PostRequest) => {
    if (generationCount >= FREE_LIMIT && !isPro) {
      setIsPaymentModalOpen(true);
      return;
    }

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
      } : undefined
    };

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateLinkedInPost(enrichedRequest);
      setCurrentPost(result);
      
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

  // Check for payment success on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true' && userId) {
      // Stripe webhook is the source of truth for Pro upgrades.
      // Clean URL and show success; the next hydration cycle will pull `is_pro` from Supabase.
      window.history.replaceState({}, '', window.location.pathname);
      alert("🎉 Payment successful! Your Pro access will activate shortly.");
    }
  }, [userId]);

  const handleUpgrade = () => {
    if (!userId) return;
    
    // Pass userId as client_reference_id for future webhook matching
    const paymentLink = `https://buy.stripe.com/bJe28q0Kv4bF3fAeOr1Nu07?client_reference_id=${userId}`;
    window.location.href = paymentLink;
  };

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

  // Show onboarding only for guests (not logged in), or when explicitly editing settings.
  // Logged-in users should never be forced back into onboarding on refresh.
  if (!userId || isEditingSettings) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                <strong>Error:</strong> {error}
              </div>
            )}
            <OnboardingWizard 
            onComplete={async (newSettings) => {
              setUserSettings(newSettings);
              setIsEditingSettings(false);
              setError(null);
              
              // If we have a user ID (either from existing session or just signed up in Wizard), save settings
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Factory className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700">
              Content Factory
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsEditingSettings(true)}
              className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center text-sm font-medium"
            >
              <Settings className="w-4 h-4 mr-1.5" />
              Factory Settings
            </button>
            
            {!isPro && (
                <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors flex items-center text-xs font-bold"
                >
                <Zap className="w-3 h-3 mr-1 fill-current" />
                Upgrade
                </button>
            )}

            <div className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-500">
              {isPro ? 'Unlimited Pro Access' : `${Math.max(0, FREE_LIMIT - generationCount)} credits left`}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <PaymentModal 
            isOpen={isPaymentModalOpen} 
            onClose={() => setIsPaymentModalOpen(false)} 
            onUpgrade={handleUpgrade}
        />

        {/* API Key Warning (For Demo Purposes) */}
        {!hasConfiguredApiKey && (
             <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start">
                <span className="mr-2">⚠️</span>
                <span>
              <strong>Missing API Key:</strong> Configure <code>DEEPSEEK_API_KEY</code> in your server environment (.env.local) so the local proxy can authenticate requests.
                </span>
            </div>
        )}

        {error && (
             <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                <strong>Error:</strong> {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-4 xl:col-span-4">
            <div className="sticky top-24">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Draft your next viral post</h2>
                    <p className="text-slate-500 mt-2">Select your audience and category to access 80+ proven frameworks.</p>
                </div>
                <InputForm 
                  onSubmit={handleGenerate} 
                  isLoading={isLoading} 
                  userSettings={userSettings}
                />
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8 xl:col-span-8">
            <GeneratedPost 
              post={currentPost} 
              isLoading={isLoading}
              statusText={generationStatus}
              onReset={handleReset} 
              userSettings={userSettings}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;