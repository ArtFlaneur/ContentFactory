import React, { useEffect } from 'react';
import { Audience, Category, PostRequest, PostGoal, PostTone, Language, UserSettings } from '../types';
import { AUDIENCE_OPTIONS, CATEGORY_OPTIONS, GOAL_OPTIONS, TONE_OPTIONS, FRAMEWORKS, FRAMEWORK_PRO_TIPS } from '../constants';
import { Loader2, Info, Globe, Lightbulb, ChevronDown } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: PostRequest) => void;
  isLoading: boolean;
  userSettings?: UserSettings | null;
}

type SourceValidationDetails = {
  valid: string[];
  invalid: Array<{ url: string; status: number | null; reason?: string }>;
};
export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, userSettings }) => {
  // Determine available audiences: User's custom ones OR defaults
  const availableAudiences = React.useMemo(() => {
    const base = (userSettings?.targetAudiences && userSettings.targetAudiences.filter(a => a.trim()).length > 0)
      ? userSettings.targetAudiences.filter(a => a.trim())
      : AUDIENCE_OPTIONS;
    return base;
  }, [userSettings]);

  const [audience, setAudience] = React.useState<string>(availableAudiences[0]);
  const [category, setCategory] = React.useState<Category>(Category.HARSH_TRUTHS);
  const [topic, setTopic] = React.useState('');
  const [frameworkId, setFrameworkId] = React.useState('');
  const [includeNews, setIncludeNews] = React.useState(false);
  const [sourceUrlsText, setSourceUrlsText] = React.useState('');
  const [goal, setGoal] = React.useState<PostGoal>(PostGoal.AUTHORITY);
  const [tone, setTone] = React.useState<PostTone>(userSettings?.preferredTone || PostTone.ANALYTICAL);
  const [language, setLanguage] = React.useState<Language>(userSettings?.preferredLanguage || Language.ENGLISH);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [sourceValidationState, setSourceValidationState] = React.useState<'idle' | 'validating' | 'done'>('idle');
  const [sourceValidationDetails, setSourceValidationDetails] = React.useState<SourceValidationDetails>({ valid: [], invalid: [] });

  const resetSourceValidation = React.useCallback(() => {
    setSourceValidationState('idle');
    setSourceValidationDetails({ valid: [], invalid: [] });
  }, []);

  const handleRemoveInvalidUrl = React.useCallback((url: string) => {
    setSourceUrlsText((prev) => {
      const next = prev
        .split(/\r?\n/)
        .filter((line) => line.trim() !== url)
        .join('\n');
      return next;
    });
    setSourceValidationDetails((prev) => ({
      valid: prev.valid,
      invalid: prev.invalid.filter((entry) => entry.url !== url),
    }));
  }, []);

  const validateSources = async (urls: string[]): Promise<SourceValidationDetails> => {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ urls })
    });

    if (!response.ok) {
      throw new Error('validation_failed');
    }

    const data = await response.json();
    const invalid = Array.isArray(data.results)
      ? data.results
          .filter((entry: any) => !entry.ok)
          .map((entry: any) => ({
            url: entry.url,
            status: typeof entry.status === 'number' ? entry.status : null,
            reason: entry.reason,
          }))
      : [];

    return {
      valid: Array.isArray(data.valid) ? data.valid : [],
      invalid,
    };
  };

  const isComments = category === Category.COMMENTS;

  // Update defaults if userSettings change
  useEffect(() => {
    if (userSettings) {
      const validAudiences = userSettings.targetAudiences?.filter(a => a.trim()) || [];
      if (validAudiences.length > 0) {
        setAudience(validAudiences[0]);
      }
      if (userSettings.preferredTone) setTone(userSettings.preferredTone);
      if (userSettings.preferredLanguage) setLanguage(userSettings.preferredLanguage);
    }
  }, [userSettings]);


  // Handle category change to reset specific framework selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCategory = e.target.value as Category;
    setCategory(nextCategory);
    setFrameworkId(''); // Reset when category changes

    if (nextCategory === Category.COMMENTS) {
      // Comments mode doesn't use frameworks or news grounding.
      setIncludeNews(false);
      setSourceUrlsText('');
      resetSourceValidation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setFormError(null);

    const effectiveIncludeNews = !isComments && includeNews;

    let sourceUrls: string[] | undefined;

    if (effectiveIncludeNews) {
      sourceUrls = Array.from(
        new Set(
          sourceUrlsText
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean)
        )
      ).slice(0, 20);

      if (!sourceUrls || sourceUrls.length === 0) {
        setFormError('Please provide at least one credible source or disable "Enrich with latest news & facts".');
        return;
      }

      try {
        setSourceValidationState('validating');
        const validation = await validateSources(sourceUrls);
        setSourceValidationDetails(validation);
        setSourceValidationState('done');
        sourceUrls = validation.valid;

        if (!sourceUrls.length) {
          setFormError('All provided sources failed validation. Update the list or disable news enrichment.');
          return;
        }
      } catch (err) {
        console.error('Source validation failed', err);
        setSourceValidationState('idle');
        setSourceValidationDetails({ valid: [], invalid: [] });
        setFormError('Could not verify your sources. Check the URLs or try again.');
        return;
      }
    } else {
      resetSourceValidation();
    }

    onSubmit({
      audience,
      category,
      topic,
      language,
      frameworkId: isComments ? undefined : frameworkId,
      includeNews: effectiveIncludeNews,
      sourceUrls: sourceUrls && sourceUrls.length > 0 ? sourceUrls : undefined,
      goal,
      tone
    });
  };

  const currentFrameworks = FRAMEWORKS[category] || [];
  const selectedFrameworkDef = currentFrameworks.find(f => f.id === frameworkId);

  return (
    <div className="bg-white rounded-none shadow-none border-2 border-black p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Post Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="p-3 bg-red-50 border-2 border-red-300 text-red-800 text-sm rounded-none">
            {formError}
          </div>
        )}

        {/* Audience Selection */}
        <div>
          <label htmlFor="audience-select" className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
        <div className="relative">
          <select 
            id="audience-select"
              value={audience} 
              onChange={(e) => setAudience(e.target.value)}
            className="w-full appearance-none rounded-none border-2 border-black shadow-none focus:border-indigo-600 focus:ring-indigo-600 p-2.5 pr-10 bg-slate-50"
          >
              {availableAudiences.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700" />
        </div>
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
        <div className="relative">
          <select 
            id="category-select"
              value={category} 
              onChange={handleCategoryChange}
            className="w-full appearance-none rounded-none border-2 border-black shadow-none focus:border-indigo-600 focus:ring-indigo-600 p-2.5 pr-10 bg-slate-50"
          >
              {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700" />
        </div>
        </div>

        {/* Goal Selection */}
        <div>
          <label htmlFor="goal-select" className="block text-sm font-medium text-slate-700 mb-1">Post Goal (CTA)</label>
        <div className="relative">
          <select 
            id="goal-select"
              value={goal} 
              onChange={(e) => setGoal(e.target.value as PostGoal)}
            className="w-full appearance-none rounded-none border-2 border-black shadow-none focus:border-indigo-600 focus:ring-indigo-600 p-2.5 pr-10 bg-slate-50"
          >
              {GOAL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700" />
        </div>
        </div>

        {/* Tone Selection */}
        <div>
          <label htmlFor="tone-select" className="block text-sm font-medium text-slate-700 mb-1">Tone / Vibe</label>
        <div className="relative">
          <select 
            id="tone-select"
              value={tone} 
              onChange={(e) => setTone(e.target.value as PostTone)}
            className="w-full appearance-none rounded-none border-2 border-black shadow-none focus:border-indigo-600 focus:ring-indigo-600 p-2.5 pr-10 bg-slate-50"
          >
              {TONE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700" />
        </div>
        </div>

        {/* Language Selection */}
        <div>
        <label htmlFor="language-select" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Output Language
        </label>
        <div className="relative">
          <select 
              id="language-select"
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full appearance-none rounded-none border-2 border-black shadow-none focus:border-indigo-600 focus:ring-indigo-600 p-2.5 pr-10 bg-slate-50"
          >
              {Object.values(Language).map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
              ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700" />
        </div>
        </div>

        {/* Specific Framework Selection (not used for Comments) */}
        {!isComments && (
          <div>
            <label htmlFor="framework-select" className="block text-sm font-medium text-slate-700 mb-1">
              Specific Framework <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <select
                id="framework-select"
                value={frameworkId}
                onChange={(e) => setFrameworkId(e.target.value)}
                className="w-full appearance-none rounded-none border-2 border-black shadow-none focus:border-indigo-600 focus:ring-indigo-600 p-2.5 pr-10 bg-slate-50"
              >
                <option value="">✨ Auto-select best structure</option>
                {currentFrameworks.map((fw) => (
                  <option key={fw.id} value={fw.id}>
                    {fw.id}: {fw.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700" />
            </div>
              
            {/* Contextual Help for Selected Framework - Fixed min-height to prevent layout shifts */}
            <div className="mt-2 min-h-[60px]">
              {selectedFrameworkDef ? (
                <div className="space-y-2">
                  <div className="p-3 bg-indigo-50 text-indigo-900 text-xs rounded-none border-2 border-black flex items-start">
                    <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Structure:</strong> {selectedFrameworkDef.description}
                    </span>
                  </div>
                  {FRAMEWORK_PRO_TIPS[selectedFrameworkDef.id] && (
                    <div className="p-3 bg-amber-50 text-amber-950 text-xs rounded-none border-2 border-black flex items-start">
                      <Lightbulb className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong>Pro Tip:</strong> {FRAMEWORK_PRO_TIPS[selectedFrameworkDef.id]}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Leave on "Auto-select" to let AI choose the best framework for your topic.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Topic Input */}
        <div>
          <label htmlFor="topic-input" className="block text-sm font-medium text-slate-700 mb-1">
            {isComments ? 'Post text to reply to' : 'Topic / Idea'}
          </label>
          <textarea 
            id="topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={frameworkId === 'Framework 70' 
              ? "Paste 3 links to news items here..." 
              : isComments
                ? "Paste the post you're replying to (or the key excerpt)..."
                : "e.g., Why paper guides at festivals are dead..."}
            rows={isComments ? 6 : 4}
            className="w-full rounded-none border-2 border-black shadow-none focus:border-indigo-600 focus:ring-indigo-600 p-3 bg-white"
            required
          />
        </div>

        {/* Search Grounding Toggle (not used for Comments) */}
        {!isComments && (
          <>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="includeNews"
                  name="includeNews"
                  type="checkbox"
                  checked={includeNews}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIncludeNews(checked);
                    setFormError(null);
                    if (!checked) {
                      resetSourceValidation();
                      setSourceUrlsText('');
                    }
                  }}
                  className="focus:ring-indigo-600 h-4 w-4 text-indigo-600 border-black rounded-none"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="includeNews" className="font-medium text-slate-700 flex items-center">
                   <Globe className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                   Enrich with latest news & facts
                </label>
                <p className="text-slate-500">AI will search for real-time data to back up your post.</p>
              </div>
            </div>

            {includeNews && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="sources-input" className="block text-sm font-medium text-slate-700 mb-1">
                    Sources (URLs)
                    <span className="text-slate-400 font-normal"> (one per line)</span>
                  </label>
                  <textarea
                    id="sources-input"
                    value={sourceUrlsText}
                    onChange={(e) => {
                      setSourceUrlsText(e.target.value);
                      resetSourceValidation();
                      setFormError(null);
                    }}
                    placeholder="https://example.com/article\nhttps://another.com/report"
                    rows={3}
                    className="w-full rounded-none border-2 border-black shadow-none focus:border-indigo-600 focus:ring-indigo-600 p-3 bg-white"
                  />
                  <p className="text-xs text-slate-500">
                    When enabled, the model will be restricted to these sources only. Invalid links will be removed from the result.
                  </p>
                  {sourceValidationState === 'validating' && (
                    <p className="text-xs text-indigo-600 mt-1">Validating sources…</p>
                  )}
                  {sourceValidationState === 'done' && (
                    <div className="mt-2 text-xs space-y-1">
                      <p className="text-green-700 font-semibold">
                        {sourceValidationDetails.valid.length} source{sourceValidationDetails.valid.length === 1 ? '' : 's'} verified.
                      </p>
                      {sourceValidationDetails.invalid.length > 0 && (
                        <div className="text-amber-700">
                          <p>Some links were dropped:</p>
                          <ul className="space-y-1">
                            {sourceValidationDetails.invalid.map((entry) => (
                              <li key={entry.url} className="flex items-start justify-between gap-2">
                                <span className="text-left flex-1">
                                  {entry.url}
                                  {entry.status ? ` (status ${entry.status})` : ''}
                                  {entry.reason ? ` – ${entry.reason}` : ''}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInvalidUrl(entry.url)}
                                  className="text-xs px-2 py-0.5 border border-amber-500 text-amber-800 rounded-none hover:bg-amber-100"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full flex justify-center items-center py-3 px-4 border-2 border-black rounded-none shadow-none text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Generating...
            </>
          ) : (
            isComments ? 'Generate Comment' : 'Generate Post'
          )}
        </button>
      </form>
    </div>
  );
};