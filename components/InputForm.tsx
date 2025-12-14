import React, { useEffect } from 'react';
import { Audience, Category, PostRequest, PostGoal, PostTone, UserSettings } from '../types';
import { AUDIENCE_OPTIONS, CATEGORY_OPTIONS, GOAL_OPTIONS, TONE_OPTIONS, FRAMEWORKS, FRAMEWORK_PRO_TIPS } from '../constants';
import { Loader2, Info, Globe, Lightbulb } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: PostRequest) => void;
  isLoading: boolean;
  userSettings?: UserSettings | null;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, userSettings }) => {
  // Determine available audiences: User's custom ones OR defaults
  const availableAudiences = (userSettings?.targetAudiences && userSettings.targetAudiences.filter(a => a.trim()).length > 0)
    ? userSettings.targetAudiences.filter(a => a.trim())
    : AUDIENCE_OPTIONS;

  const [audience, setAudience] = React.useState<string>(availableAudiences[0]);
  const [category, setCategory] = React.useState<Category>(Category.HARSH_TRUTHS);
  const [topic, setTopic] = React.useState('');
  const [frameworkId, setFrameworkId] = React.useState('');
  const [includeNews, setIncludeNews] = React.useState(false);
  const [sourceUrlsText, setSourceUrlsText] = React.useState('');
  const [goal, setGoal] = React.useState<PostGoal>(PostGoal.AUTHORITY);
  const [tone, setTone] = React.useState<PostTone>(userSettings?.preferredTone || PostTone.ANALYTICAL);

  const isComments = category === Category.COMMENTS;

  // Update defaults if userSettings change
  useEffect(() => {
    if (userSettings) {
      const validAudiences = userSettings.targetAudiences?.filter(a => a.trim()) || [];
      if (validAudiences.length > 0) {
        setAudience(validAudiences[0]);
      }
      if (userSettings.preferredTone) setTone(userSettings.preferredTone);
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const effectiveIncludeNews = !isComments && includeNews;

    const sourceUrls = effectiveIncludeNews
      ? Array.from(
          new Set(
            sourceUrlsText
              .split(/\r?\n/)
              .map((s) => s.trim())
              .filter(Boolean)
          )
        ).slice(0, 20)
      : undefined;

    onSubmit({
      audience,
      category,
      topic,
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Post Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Audience Selection */}
        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
        <select 
            value={audience} 
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-slate-50 border"
        >
            {availableAudiences.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
        </select>
        </div>

        {/* Category Selection */}
        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
        <select 
            value={category} 
            onChange={handleCategoryChange}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-slate-50 border"
        >
            {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        </div>

        {/* Goal Selection */}
        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Post Goal (CTA)</label>
        <select 
            value={goal} 
            onChange={(e) => setGoal(e.target.value as PostGoal)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-slate-50 border"
        >
            {GOAL_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        </div>

        {/* Tone Selection */}
        <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tone / Vibe</label>
        <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value as PostTone)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-slate-50 border"
        >
            {TONE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        </div>

        {/* Specific Framework Selection (not used for Comments) */}
        {!isComments && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Specific Framework <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <select
              value={frameworkId}
              onChange={(e) => setFrameworkId(e.target.value)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-slate-50 border"
            >
              <option value="">✨ Auto-select best structure</option>
              {currentFrameworks.map((fw) => (
                <option key={fw.id} value={fw.id}>
                  {fw.id}: {fw.name}
                </option>
              ))}
            </select>
              
            {/* Contextual Help for Selected Framework */}
            {selectedFrameworkDef ? (
              <div className="mt-2 space-y-2">
                <div className="p-3 bg-indigo-50 text-indigo-800 text-xs rounded-lg flex items-start">
                  <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Structure:</strong> {selectedFrameworkDef.description}
                  </span>
                </div>
                {FRAMEWORK_PRO_TIPS[selectedFrameworkDef.id] && (
                  <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-lg flex items-start border border-amber-100">
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
        )}

        {/* Topic Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {isComments ? 'Post text to reply to' : 'Topic / Idea'}
          </label>
          <textarea 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={frameworkId === 'Framework 70' 
              ? "Paste 3 links to news items here..." 
              : isComments
                ? "Paste the post you're replying to (or the key excerpt)..."
                : "e.g., Why paper guides at festivals are dead..."}
            rows={isComments ? 6 : 4}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
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
                  onChange={(e) => setIncludeNews(e.target.checked)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
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
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sources (URLs)
                  <span className="text-slate-400 font-normal"> (one per line)</span>
                </label>
                <textarea
                  value={sourceUrlsText}
                  onChange={(e) => setSourceUrlsText(e.target.value)}
                  placeholder="https://example.com/article\nhttps://another.com/report"
                  rows={3}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                />
                <p className="text-xs text-slate-500">
                  When enabled, the model will be restricted to these sources only. Invalid links will be removed from the result.
                </p>
              </div>
            )}
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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