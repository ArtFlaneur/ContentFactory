import React, { useState } from 'react';
import { UserSettings, PostTone, OrganizationInfo } from '../types';
import { Factory, Users, Share2, ArrowRight, Check, Lock, LogOut, Building2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { getAppBaseUrl } from '../services/appUrl';
import { storage } from '../services/storage';

interface OnboardingWizardProps {
  onComplete: (settings: UserSettings) => void;
  initialSettings?: UserSettings | null;
  onCancel?: () => void;
  userId?: string | null;
}

const STEPS = [
  { id: 1, title: 'Factory Setup', icon: Factory, description: 'Define your industry and role' },
  { id: 2, title: 'Target Audience', icon: Users, description: 'Who are you writing for?' },
  { id: 3, title: 'Distribution', icon: Share2, description: 'Where will you publish?' },
  { id: 4, title: 'Secure Access', icon: Lock, description: 'Save your factory settings' },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, initialSettings, onCancel, userId }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [settings, setSettings] = useState<Partial<UserSettings>>(initialSettings || {
    industry: '',
    role: '',
    targetAudiences: ['', '', ''],
    primaryPlatforms: ['linkedin'],
    preferredTone: PostTone.PROFESSIONAL,
    customCTAs: []
  });

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      if (initialSettings || userId) {
        // Editing mode or already logged in, just save
        onComplete(settings as UserSettings);
      } else {
        // New user, go to signup
        setStep(4);
      }
    } else if (step === 4) {
      // If user is already logged in (fallback), just save
      if (userId) {
        onComplete(settings as UserSettings);
        return;
      }

      // Handle Auth
      setIsSigningUp(true);
      setAuthError(null);
      
      try {
        const emailTrimmed = email.trim();
        const emailNormalized = emailTrimmed.toLowerCase();

        if (!emailTrimmed) {
          setAuthError('Please enter your email address.');
          return;
        }
        if (!password) {
          setAuthError('Please enter a password.');
          return;
        }

        let authResponse;
        
        if (isLoginMode) {
          authResponse = await supabase.auth.signInWithPassword({
            email: emailTrimmed,
            password,
          });
        } else {
          const emailRedirectTo = getAppBaseUrl();
          authResponse = await supabase.auth.signUp({
            email: emailTrimmed,
            password,
            options: {
              ...(emailRedirectTo ? { emailRedirectTo } : {}),
              // Persist onboarding settings server-side so they survive email confirmation flows
              // (no session) and cross-device logins.
              data: {
                cf_onboarding_settings: settings
              }
            },
          });
        }

        const { data, error } = authResponse;

        if (error) throw error;

        if (data.user) {
          if (isLoginMode) {
            // If logging in, DO NOT save the wizard settings (which might be empty/default).
            // Instead, just let the auth state change listener in App.tsx handle the profile loading.
            // We can optionally show a success message here or just wait for the redirect.
          } else {
            // If email confirmation is enabled, Supabase may not return a session yet.
            // In that case, the user is not actually logged in and we should not proceed.
            if (!data.session) {
                // Email confirmation flow: there is no session yet, so we can't write to `profiles`.
                // Store the onboarding settings locally so we can apply them after the user confirms
                // their email and logs in.
                try {
                  const payload = JSON.stringify(settings);
                  const normalizedKey = `pending_onboarding_settings_${encodeURIComponent(emailNormalized)}`;
                  const legacyKey = `pending_onboarding_settings_${encodeURIComponent(emailTrimmed)}`;
                  storage.setItem(normalizedKey, payload);
                  storage.setItem(legacyKey, payload);
                } catch {
                  // ignore
                }
              setAuthError('Check your email to confirm your account, then log in to continue.');
              return;
            }
            // If signing up, we want to save the settings the user just configured.
            onComplete(settings as UserSettings);
          }
        }
      } catch (err: any) {
        setAuthError(err.message);
      } finally {
        setIsSigningUp(false);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setAuthError("Please enter your email address first.");
      return;
    }
    try {
      const redirectTo = getAppBaseUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || window.location.origin,
      });
      if (error) throw error;
      alert("Password reset instructions sent to your email!");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err?.message || 'Logout failed.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-none shadow-none border-2 border-black max-w-2xl md:max-w-3xl lg:max-w-4xl w-full overflow-hidden flex flex-col md:flex-row min-h-[500px] md:min-h-[640px]">
        
        {/* Sidebar */}
        <div className="bg-white p-8 text-slate-900 md:w-1/3 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-black">
          <div>
            <div className="flex items-center space-x-2 mb-8">
              <Factory className="h-6 w-6" />
              <span className="font-bold text-xl">Make Content</span>
            </div>
            <nav className="space-y-4">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-start space-x-3 p-3 border-2 border-black rounded-none ${
                    step === s.id
                      ? s.id === 1
                        ? 'bg-indigo-200'
                        : s.id === 2
                          ? 'bg-amber-200'
                          : s.id === 3
                            ? 'bg-emerald-200'
                            : 'bg-rose-200'
                      : s.id === 1
                        ? 'bg-indigo-50'
                        : s.id === 2
                          ? 'bg-amber-50'
                          : s.id === 3
                            ? 'bg-emerald-50'
                            : 'bg-rose-50'
                  }`}
                >
                  <div
                    className={`mt-1 w-6 h-6 rounded-none flex items-center justify-center text-xs font-bold border-2 border-black ${
                      step === s.id
                        ? 'bg-white text-slate-900'
                        : 'bg-white/80 text-slate-700'
                    }`}
                  >
                    {step > s.id ? <Check size={14} /> : s.id}
                  </div>
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-xs text-slate-600">{s.description}</p>
                  </div>
                </div>
              ))}
            </nav>
          </div>
          <div className="text-xs text-slate-600 mt-8">
            Step {step} of 4
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 pb-8 pt-6 md:w-2/3 flex flex-col">
          <div className="flex-1">
            {userId && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-slate-700 hover:text-slate-900 transition-colors inline-flex items-center text-sm font-medium px-3 py-1 border-2 border-black rounded-none bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Log Out"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Log Out
                </button>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 px-6 pb-6 pt-3 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Let's build your factory</h2>
                    <p className="text-slate-500">Tell us about your professional context so we can tune the AI.</p>
                  </div>
                  {!initialSettings && !userId && (
                    <button 
                      onClick={() => {
                        setStep(4);
                        setIsLoginMode(true);
                      }}
                      className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
                    >
                      Already have an account?
                    </button>
                  )}
                </div>
                
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">Industry / Niche</label>
                  <input 
                    id="industry"
                    name="industry"
                    type="text" 
                    autoComplete="organization"
                    className="w-full p-3 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                    placeholder="e.g. SaaS Marketing, Fine Art, Crypto"
                    value={settings.industry}
                    onChange={e => setSettings({...settings, industry: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Your Role</label>
                  <input 
                    id="role"
                    name="role"
                    type="text" 
                    autoComplete="organization-title"
                    className="w-full p-3 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                    placeholder="e.g. Founder, Gallery Owner, CMO"
                    value={settings.role}
                    onChange={e => setSettings({...settings, role: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <input 
                      id="country"
                      name="country"
                      type="text" 
                      autoComplete="country-name"
                      className="w-full p-3 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                      placeholder="e.g. USA, France"
                      value={settings.country || ''}
                      onChange={e => setSettings({...settings, country: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input 
                      id="city"
                      name="city"
                      type="text" 
                      autoComplete="address-level2"
                      className="w-full p-3 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                      placeholder="e.g. New York, Paris"
                      value={settings.city || ''}
                      onChange={e => setSettings({...settings, city: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 px-6 pb-6 pt-3 bg-white">
                <h2 className="text-2xl font-bold text-slate-900">Who is this for?</h2>
                <p className="text-slate-500">Define up to 3 distinct target audiences (e.g. "Collectors", "Artists", "Investors").</p>
                
                {[0, 1, 2].map((idx) => (
                  <div key={idx}>
                    <label htmlFor={`audience-${idx}`} className="block text-sm font-medium text-slate-700 mb-1">Audience Segment #{idx + 1}</label>
                    <input 
                      id={`audience-${idx}`}
                      name={`audience-${idx}`}
                      type="text"
                      className="w-full p-3 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                      placeholder={idx === 0 ? "e.g. High Net Worth Collectors" : idx === 1 ? "e.g. Emerging Artists" : "e.g. Art Fair Directors"}
                      value={settings.targetAudiences?.[idx] || ''}
                      onChange={e => {
                        const newAudiences = [...(settings.targetAudiences || ['', '', ''])];
                        newAudiences[idx] = e.target.value;
                        setSettings({...settings, targetAudiences: newAudiences});
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 px-6 pb-6 pt-3 bg-white">
                <h2 className="text-2xl font-bold text-slate-900">Distribution Channels</h2>
                <p className="text-slate-500">Where do you want to publish content?</p>
                
                <div className="grid grid-cols-1 gap-3">
                  {['linkedin', 'X/Threads', 'telegram', 'instagram', 'youtube'].map((platform) => (
                    <label key={platform} className={`flex items-center p-4 border-2 border-black rounded-none cursor-pointer transition-all ${
                      (settings.primaryPlatforms || []).includes(platform as any) 
                        ? 'bg-white' 
                        : 'bg-slate-50 hover:bg-white'
                    }`}>
                      <input 
                        type="checkbox"
                        name={`platform-${platform}`}
                        className="w-5 h-5 text-indigo-600 rounded-none border-black focus:ring-indigo-600"
                        checked={(settings.primaryPlatforms || []).includes(platform as any)}
                        onChange={(e) => {
                          const current = settings.primaryPlatforms || [];
                          const updated = e.target.checked 
                            ? [...current, platform as any]
                            : current.filter(p => p !== platform);
                          setSettings({...settings, primaryPlatforms: updated});
                        }}
                      />
                      <span className="ml-3 font-medium capitalize">{platform}</span>
                    </label>
                  ))}
                </div>

                {/* Organization Info Section */}
                <div className="mt-8 pt-6 border-t-2 border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-900">Organization Info</h3>
                    <span className="text-xs text-slate-500">(Optional - for Press Releases)</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Fill this if you create press releases or official announcements. This data will be auto-inserted in your press releases.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="org-name" className="block text-sm font-medium text-slate-700 mb-1">
                        Organization Name
                      </label>
                      <input 
                        id="org-name"
                        type="text"
                        className="w-full p-2 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white text-sm"
                        placeholder="e.g. Modern Art Gallery"
                        value={settings.organizationInfo?.name || ''}
                        onChange={e => setSettings({
                          ...settings, 
                          organizationInfo: {...(settings.organizationInfo || {} as OrganizationInfo), name: e.target.value}
                        })}
                      />
                    </div>

                    <div>
                      <label htmlFor="org-website" className="block text-sm font-medium text-slate-700 mb-1">
                        Website
                      </label>
                      <input 
                        id="org-website"
                        type="url"
                        className="w-full p-2 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white text-sm"
                        placeholder="https://gallery.com"
                        value={settings.organizationInfo?.website || ''}
                        onChange={e => setSettings({
                          ...settings, 
                          organizationInfo: {...(settings.organizationInfo || {} as OrganizationInfo), website: e.target.value}
                        })}
                      />
                    </div>

                    <div>
                      <label htmlFor="org-city" className="block text-sm font-medium text-slate-700 mb-1">
                        City
                      </label>
                      <input 
                        id="org-city"
                        type="text"
                        className="w-full p-2 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white text-sm"
                        placeholder="e.g. New York"
                        value={settings.organizationInfo?.city || ''}
                        onChange={e => setSettings({
                          ...settings, 
                          organizationInfo: {...(settings.organizationInfo || {} as OrganizationInfo), city: e.target.value}
                        })}
                      />
                    </div>

                    <div>
                      <label htmlFor="org-country" className="block text-sm font-medium text-slate-700 mb-1">
                        Country
                      </label>
                      <input 
                        id="org-country"
                        type="text"
                        className="w-full p-2 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white text-sm"
                        placeholder="e.g. USA"
                        value={settings.organizationInfo?.country || ''}
                        onChange={e => setSettings({
                          ...settings, 
                          organizationInfo: {...(settings.organizationInfo || {} as OrganizationInfo), country: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="org-description" className="block text-sm font-medium text-slate-700 mb-1">
                      About Organization (Boilerplate)
                    </label>
                    <textarea 
                      id="org-description"
                      rows={3}
                      className="w-full p-2 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white text-sm"
                      placeholder="Brief description of your organization for press releases (2-3 sentences)"
                      value={settings.organizationInfo?.description || ''}
                      onChange={e => setSettings({
                        ...settings, 
                        organizationInfo: {...(settings.organizationInfo || {} as OrganizationInfo), description: e.target.value}
                      })}
                    />
                  </div>

                  <div className="bg-indigo-50 p-3 border-2 border-indigo-200 rounded-none">
                    <p className="text-xs font-semibold text-indigo-900 mb-2">Media Contact (for Press Releases)</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input 
                        type="text"
                        className="p-2 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white text-xs"
                        placeholder="Contact Name"
                        value={settings.organizationInfo?.contactName || ''}
                        onChange={e => setSettings({
                          ...settings, 
                          organizationInfo: {...(settings.organizationInfo || {} as OrganizationInfo), contactName: e.target.value}
                        })}
                      />
                      <input 
                        type="email"
                        className="p-2 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white text-xs"
                        placeholder="contact@gallery.com"
                        value={settings.organizationInfo?.contactEmail || ''}
                        onChange={e => setSettings({
                          ...settings, 
                          organizationInfo: {...(settings.organizationInfo || {} as OrganizationInfo), contactEmail: e.target.value}
                        })}
                      />
                      <input 
                        type="tel"
                        className="p-2 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white text-xs"
                        placeholder="+1 234 567 8900"
                        value={settings.organizationInfo?.contactPhone || ''}
                        onChange={e => setSettings({
                          ...settings, 
                          organizationInfo: {...(settings.organizationInfo || {} as OrganizationInfo), contactPhone: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 px-6 pb-6 pt-3 bg-white">
                <h2 className="text-2xl font-bold text-slate-900">
                  {isLoginMode ? 'Welcome Back' : 'Save your Factory'}
                </h2>
                <p className="text-slate-500">
                  {isLoginMode 
                    ? 'Log in to access your saved settings and history.' 
                    : 'Create an account to save your preferences and access your factory from anywhere.'}
                </p>
                
                {authError && (
                  <div className="p-3 bg-red-50 text-red-800 text-sm rounded-none border-2 border-black">
                    {authError}
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    id="auth-email"
                    name="email"
                    type="email" 
                    autoComplete="email"
                    className="w-full p-3 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="auth-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input 
                    id="auth-password"
                    name="password"
                    type="password" 
                    autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                    className="w-full p-3 border-2 border-black rounded-none focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <button 
                    onClick={() => {
                      setIsLoginMode(!isLoginMode);
                      setAuthError(null);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {isLoginMode ? "Need an account? Sign up" : "Already have an account? Log in"}
                  </button>
                  
                  {isLoginMode && (
                    <button 
                      onClick={handleResetPassword}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                
                {!isLoginMode && (
                  <p className="text-xs text-slate-400 mt-4">
                    By creating an account, you agree to our Terms of Service.
                  </p>
                )}
              </div>
            )}
          </div>

           <div className="mt-8 flex justify-between items-center pt-6 border-t-2 border-black">
             <div className="flex items-center space-x-4">
               {step > 1 ? (
                  <button 
                    onClick={() => {
                      if (step === 4 && isLoginMode && !initialSettings) {
                        // If we jumped to login from step 1, go back to step 1
                        setStep(1);
                        setIsLoginMode(false);
                      } else {
                        setStep(step - 1);
                      }
                    }}
                    className="text-slate-800 hover:text-slate-900 font-medium px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border-2 border-black rounded-none bg-white hover:bg-slate-50 inline-flex items-center justify-center h-9 sm:h-10"
                  >
                    Back
                  </button>
               ) : onCancel ? (
                  <button 
                    onClick={onCancel}
                    className="text-slate-800 hover:text-red-700 font-medium px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border-2 border-black rounded-none bg-white hover:bg-slate-50 inline-flex items-center justify-center h-9 sm:h-10"
                  >
                    Cancel
                  </button>
               ) : <div></div>}
             </div>
             
             <button 
               onClick={handleNext}
               disabled={isSigningUp}
               className="bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-none border-2 border-black font-medium text-xs sm:text-sm hover:bg-indigo-700 transition-colors inline-flex items-center justify-center h-9 sm:h-10 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSigningUp 
                 ? (isLoginMode ? 'Logging in...' : 'Creating Account...') 
                 : step === 4 
                   ? (isLoginMode ? 'Log In & Launch' : 'Create Account & Launch') 
                   : (step === 3 && (initialSettings || userId)) 
                     ? 'Save & Launch' 
                     : 'Next Step'}
               {!isSigningUp && <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
