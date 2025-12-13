import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { GeneratedPost } from './components/GeneratedPost';
import { OnboardingWizard } from './components/OnboardingWizard';
import { PaymentModal } from './components/PaymentModal';
import { PostRequest, GeneratedPost as GeneratedPostType, UserSettings } from './types';
import { generateLinkedInPost } from './services/deepseekService';
import { userService } from './services/userService';
import { supabase } from './services/supabaseClient';
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
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Initialize generation count from localStorage for guests, or 0
  const [generationCount, setGenerationCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('guest_generation_count');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  const [currentPost, setCurrentPost] = useState<GeneratedPostType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FREE_LIMIT = 3;

  // Load user profile on startup
  React.useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const profile = await userService.getProfile(session.user.id);
        if (profile) {
          setUserSettings(profile.settings);
          // For logged in users, always trust the DB count
          setGenerationCount(profile.generationCount || 0);
          
          // If user is Pro in DB, update local state
          if (profile.isPro && profile.settings) {
             setUserSettings(prev => prev ? { ...prev, isPro: true } : null);
          }
        }
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        
        // Check for guest generations to sync
        const guestCount = parseInt(localStorage.getItem('guest_generation_count') || '0', 10);
        
        if (guestCount > 0 && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
           console.log(`Syncing ${guestCount} guest generations to user ${session.user.id}...`);
           // Sync guest count to DB
           const success = await userService.syncGuestGenerations(session.user.id, guestCount);
           
           if (success) {
             console.log('Guest generations synced successfully.');
             // Clear guest count only on success
             localStorage.removeItem('guest_generation_count');
           } else {
             console.error('Failed to sync guest generations. Keeping local count.');
           }
        }

        // Reload profile (now including synced count)
        const profile = await userService.getProfile(session.user.id);
        if (profile) {
          setUserSettings(profile.settings);
          setGenerationCount(profile.generationCount || 0);
        }
      } else {
        // User logged out
        setUserId(null);
        setUserSettings(null);
        // Revert to guest count from local storage
        const saved = localStorage.getItem('guest_generation_count');
        setGenerationCount(saved ? parseInt(saved, 10) : 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGenerate = async (request: PostRequest) => {
    if (generationCount >= FREE_LIMIT && !userSettings?.isPro) {
      setIsPaymentModalOpen(true);
      return;
    }

    // Inject User Context from Onboarding
    const enrichedRequest = {
      ...request,
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
          localStorage.setItem('guest_generation_count', newCount.toString());
        }
        return newCount;
      });
      
      // Sync generation count to DB if logged in
      if (userId) {
        userService.incrementGenerationCount(userId).catch(console.error);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong generating the post.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
      setCurrentPost(null);
      setError(null);
  };

  // Check for payment success on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true' && userId) {
      // Upgrade user
      userService.upgradeToPro(userId).then(() => {
        // Update local state
        setUserSettings(prev => prev ? { ...prev, isPro: true } : null);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        alert("🎉 Payment successful! You are now a Pro member.");
      }).catch(console.error);
    }
  }, [userId]);

  const handleUpgrade = () => {
    if (!userId) return;
    
    // Pass userId as client_reference_id for future webhook matching
    const paymentLink = `https://buy.stripe.com/bJe28q0Kv4bF3fAeOr1Nu07?client_reference_id=${userId}`;
    window.location.href = paymentLink;
  };

  if (!userSettings || isEditingSettings) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-grow flex items-center justify-center">
          <OnboardingWizard 
            onComplete={async (newSettings) => {
              setUserSettings(newSettings);
              setIsEditingSettings(false);
              
              // If we have a user ID (either from existing session or just signed up in Wizard), save settings
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                await userService.updateSettings(session.user.id, newSettings);
                setUserId(session.user.id);
              }
            }} 
            initialSettings={userSettings}
            onCancel={userSettings ? () => setIsEditingSettings(false) : undefined}
          />
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
            
            {!userSettings?.isPro && (
                <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors flex items-center text-xs font-bold"
                >
                <Zap className="w-3 h-3 mr-1 fill-current" />
                Upgrade
                </button>
            )}

            <div className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-500">
              {userSettings?.isPro ? 'Unlimited Pro Access' : `${FREE_LIMIT - generationCount} credits left`}
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