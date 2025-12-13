import React, { useState } from 'react';
import { UserSettings, PostTone } from '../types';
import { Factory, Users, Share2, ArrowRight, Check, Lock } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface OnboardingWizardProps {
  onComplete: (settings: UserSettings) => void;
  initialSettings?: UserSettings | null;
  onCancel?: () => void;
}

const STEPS = [
  { id: 1, title: 'Factory Setup', icon: Factory, description: 'Define your industry and role' },
  { id: 2, title: 'Target Audience', icon: Users, description: 'Who are you writing for?' },
  { id: 3, title: 'Distribution', icon: Share2, description: 'Where will you publish?' },
  { id: 4, title: 'Secure Access', icon: Lock, description: 'Save your factory settings' },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, initialSettings, onCancel }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
      if (initialSettings) {
        // Editing mode, just save
        onComplete(settings as UserSettings);
      } else {
        // New user, go to signup
        setStep(4);
      }
    } else if (step === 4) {
      // Handle Signup
      setIsSigningUp(true);
      setAuthError(null);
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Profile creation is handled by Supabase Trigger, but we need to update it with settings
          // We'll pass the settings to the parent, which will handle the update via userService
          onComplete(settings as UserSettings);
        }
      } catch (err: any) {
        setAuthError(err.message);
      } finally {
        setIsSigningUp(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Sidebar */}
        <div className="bg-indigo-900 p-8 text-white md:w-1/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-8">
               <Factory className="h-6 w-6" />
               <span className="font-bold text-xl">Content Factory</span>
            </div>
            <nav className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.id} className={`flex items-start space-x-3 ${step === s.id ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step === s.id ? 'bg-white text-indigo-900 border-white' : 'border-indigo-400'}`}>
                    {step > s.id ? <Check size={14} /> : s.id}
                  </div>
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-xs text-indigo-200">{s.description}</p>
                  </div>
                </div>
              ))}
            </nav>
          </div>
          <div className="text-xs text-indigo-300 mt-8">
            Step {step} of 4
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 md:w-2/3 flex flex-col">
          <div className="flex-1">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-slate-900">Let's build your factory</h2>
                <p className="text-slate-500">Tell us about your professional context so we can tune the AI.</p>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industry / Niche</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. SaaS Marketing, Fine Art, Crypto"
                    value={settings.industry}
                    onChange={e => setSettings({...settings, industry: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your Role</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Founder, Gallery Owner, CMO"
                    value={settings.role}
                    onChange={e => setSettings({...settings, role: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. USA, France"
                      value={settings.country || ''}
                      onChange={e => setSettings({...settings, country: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input 
                      type="text" 
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. New York, Paris"
                      value={settings.city || ''}
                      onChange={e => setSettings({...settings, city: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-slate-900">Who is this for?</h2>
                <p className="text-slate-500">Define up to 3 distinct target audiences (e.g. "Collectors", "Artists", "Investors").</p>
                
                {[0, 1, 2].map((idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Audience Segment #{idx + 1}</label>
                    <input 
                      type="text"
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-slate-900">Distribution Channels</h2>
                <p className="text-slate-500">Where do you want to publish content?</p>
                
                <div className="grid grid-cols-1 gap-3">
                  {['linkedin', 'twitter', 'telegram', 'instagram', 'youtube'].map((platform) => (
                    <label key={platform} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      (settings.primaryPlatforms || []).includes(platform as any) 
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}>
                      <input 
                        type="checkbox"
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
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
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold text-slate-900">Save your Factory</h2>
                <p className="text-slate-500">Create an account to save your preferences and access your factory from anywhere.</p>
                
                {authError && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                    {authError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  By creating an account, you agree to our Terms of Service.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
             <div className="flex items-center space-x-4">
               {step > 1 ? (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2"
                  >
                    Back
                  </button>
               ) : onCancel ? (
                  <button 
                    onClick={onCancel}
                    className="text-slate-500 hover:text-red-600 font-medium px-4 py-2"
                  >
                    Cancel
                  </button>
               ) : <div></div>}
             </div>
             
             <button 
               onClick={handleNext}
               disabled={isSigningUp}
               className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSigningUp ? 'Creating Account...' : step === 4 ? 'Create Account & Launch' : (step === 3 && initialSettings) ? 'Save Changes' : 'Next Step'}
               {!isSigningUp && <ArrowRight className="ml-2 h-4 w-4" />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
