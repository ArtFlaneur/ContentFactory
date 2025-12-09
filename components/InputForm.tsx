import React from 'react';
import { Audience, Category, PostRequest } from '../types';
import { AUDIENCE_OPTIONS, CATEGORY_OPTIONS, FRAMEWORKS } from '../constants';
import { Loader2, Info, Globe } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: PostRequest) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [audience, setAudience] = React.useState<Audience>(Audience.GALLERY_OWNERS);
  const [category, setCategory] = React.useState<Category>(Category.HARSH_TRUTHS);
  const [topic, setTopic] = React.useState('');
  const [frameworkId, setFrameworkId] = React.useState('');
  const [includeNews, setIncludeNews] = React.useState(false);

  // Handle category change to reset specific framework selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value as Category);
    setFrameworkId(''); // Reset when category changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSubmit({ audience, category, topic, frameworkId, includeNews });
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
            onChange={(e) => setAudience(e.target.value as Audience)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-slate-50 border"
          >
            {AUDIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
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

        {/* Specific Framework Selection */}
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
                <div className="mt-2 p-3 bg-indigo-50 text-indigo-800 text-xs rounded-lg flex items-start">
                    <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                        <strong>Structure:</strong> {selectedFrameworkDef.description}
                    </span>
                </div>
            ) : (
                 <p className="text-xs text-slate-500 mt-1">
                    Leave on "Auto-select" to let AI choose the best framework for your topic.
                </p>
            )}
        </div>

        {/* Topic Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Idea</label>
          <textarea 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Why paper guides at festivals are dead..."
            rows={4}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
            required
          />
        </div>

        {/* Search Grounding Toggle */}
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
            'Generate Post'
          )}
        </button>
      </form>
    </div>
  );
};