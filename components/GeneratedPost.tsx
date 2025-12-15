import React from 'react';
import { GeneratedPost as GeneratedPostType, UserSettings } from '../types';
import { Copy, Check, RefreshCw, ExternalLink, Linkedin, Twitter, Send, Instagram, Youtube, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface GeneratedPostProps {
  post: GeneratedPostType | null;
  isLoading?: boolean;
  statusText?: string | null;
  onReset: () => void;
  userSettings?: UserSettings | null;
}

type Tab = 'linkedin' | 'twitter' | 'telegram' | 'instagram' | 'youtube';

export const GeneratedPost: React.FC<GeneratedPostProps> = ({ post, isLoading, statusText, onReset, userSettings }) => {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<Tab>('linkedin');

  // Determine visible tabs based on user settings
  const visibleTabs = React.useMemo(() => {
    if (!userSettings?.primaryPlatforms) return ['linkedin', 'twitter', 'telegram', 'instagram', 'youtube']; // Default to all if no settings
    return userSettings.primaryPlatforms;
  }, [userSettings]);

  // Ensure active tab is valid when settings change
  React.useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0] as Tab);
    }
  }, [visibleTabs, activeTab]);

  if (!post) {
    if (isLoading) {
      return (
        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-700 border-2 border-black rounded-none bg-white p-8">
          <div className="w-14 h-14 bg-indigo-50 rounded-none border-2 border-black flex items-center justify-center mb-4">
            <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
          </div>
          <p className="font-semibold text-slate-900">Generating your post…</p>
          <p className="text-sm mt-1 text-slate-500 text-center">
            {statusText || 'Working on structure and wording'}
          </p>
          <p className="text-xs mt-3 text-slate-400 text-center max-w-sm">
            Keep this tab open. The result will appear here automatically.
          </p>
        </div>
      );
    }
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-black rounded-none bg-slate-50">
        <div className="w-16 h-16 bg-slate-50 rounded-none flex items-center justify-center mb-4">
            <span className="text-3xl">✨</span>
        </div>
        <p className="font-medium">Ready to create content</p>
        <p className="text-sm mt-1 text-slate-400 max-w-xs text-center">Select your audience and topic to generate a structured LinkedIn post.</p>
      </div>
    );
  }

  const cleanText = (text: string) => {
    return text
      .replace(/—/g, '--') // Force replace em dash with double hyphen
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/^\s*\*\s/gm, '- ') // Convert asterisk bullets to hyphens
      .replace(/\*/g, ''); // Remove remaining italic markers
  };

  // Helper to remove em dashes for display
  const displayContent = (text: string) => {
    return text.replace(/—/g, '--');
  };

  const handleCopy = () => {
    const contentToCopy = activeTab === 'linkedin' ? post.content :
                          activeTab === 'twitter' ? post.shortContent :
                          activeTab === 'telegram' ? post.telegramContent :
                          activeTab === 'instagram' ? post.instagramContent :
                          activeTab === 'youtube' ? post.youtubeContent : '';
    
    if (contentToCopy) {
        navigator.clipboard.writeText(cleanText(contentToCopy));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderTabButton = (id: Tab, icon: React.ReactNode, label: string, disabled: boolean) => (
    <button
      onClick={() => setActiveTab(id)}
      disabled={disabled}
      className={`flex flex-1 justify-center sm:flex-none sm:justify-start items-center px-3 py-2 text-sm font-medium rounded-none transition-colors ${
        activeTab === id
          ? 'text-slate-900 bg-amber-50'
          : disabled
            ? 'text-slate-400 cursor-not-allowed bg-white'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 bg-white'
      }`}
    >
      {icon}
      <span className="ml-2 hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-none shadow-none border-2 border-black overflow-hidden flex flex-col h-full">
      <div className="bg-indigo-50 px-6 py-4 border-b-2 border-black flex justify-between items-center">
        <div>
            <h3 className="font-semibold text-indigo-900">{post.title}</h3>
            <p className="text-xs text-indigo-500 mt-0.5">Tone: Professional, Raw, System-Oriented</p>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={onReset}
                className="p-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-2 border-black rounded-none transition-colors"
                title="Create New"
            >
                <RefreshCw size={18} />
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-0 sm:px-4 border-b-2 border-black bg-white">
        {visibleTabs.includes('linkedin') && renderTabButton('linkedin', <Linkedin size={16} />, 'LinkedIn', false)}
        {visibleTabs.includes('twitter') && renderTabButton('twitter', <Twitter size={16} />, 'X / Threads', !post.shortContent)}
        {visibleTabs.includes('telegram') && renderTabButton('telegram', <Send size={16} />, 'Telegram', !post.telegramContent)}
        {visibleTabs.includes('instagram') && renderTabButton('instagram', <Instagram size={16} />, 'Instagram', !post.instagramContent)}
        {visibleTabs.includes('youtube') && renderTabButton('youtube', <Youtube size={16} />, 'YouTube', !post.youtubeContent)}
      </div>
      
      <div className="flex-1 p-6 prose prose-slate prose-indigo max-w-none">
        
        {/* Alternative Hooks Section - Only for LinkedIn */}
        {activeTab === 'linkedin' && post.alternativeHooks && post.alternativeHooks.length > 0 && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-none border-2 border-black not-prose">
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-2">🧪 Hook Lab (Alternative Openers)</h4>
            <ul className="space-y-2">
              {post.alternativeHooks.map((hook, idx) => (
                <li key={idx} className="text-sm text-indigo-900 flex items-start group cursor-pointer hover:bg-indigo-100 p-1.5 rounded-none transition-colors"
                    onClick={() => {
                        navigator.clipboard.writeText(cleanText(hook));
                    }}
                    title="Click to copy hook"
                >
                  <span className="text-indigo-400 mr-2 font-mono text-xs mt-0.5">{idx + 1}.</span>
                  <span>{displayContent(hook)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[200px]">
            {activeTab === 'linkedin' && (
              <ReactMarkdown remarkPlugins={[remarkBreaks]}>{displayContent(post.content)}</ReactMarkdown>
            )}
            {activeTab === 'twitter' && <div className="whitespace-pre-wrap font-sans text-slate-700">{displayContent(post.shortContent || '')}</div>}
            {activeTab === 'telegram' && <div className="whitespace-pre-wrap font-sans text-slate-700">{displayContent(post.telegramContent || '')}</div>}
            {activeTab === 'instagram' && <div className="whitespace-pre-wrap font-sans text-slate-700">{displayContent(post.instagramContent || '')}</div>}
            {activeTab === 'youtube' && <div className="whitespace-pre-wrap font-sans text-slate-700">{displayContent(post.youtubeContent || '')}</div>}
        </div>

        {/* Source Links Section - Only for LinkedIn or if relevant */}
        {activeTab === 'linkedin' && post.sourceLinks && post.sourceLinks.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Sources & References</h4>
            <div className="flex flex-wrap gap-2">
              {post.sourceLinks.map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-white border-2 border-black rounded-none text-xs text-slate-700 hover:bg-slate-50 transition-colors no-underline"
                >
                  <span className="truncate max-w-[150px]">{link.title}</span>
                  <ExternalLink size={10} className="ml-1.5 opacity-50" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t-2 border-black flex justify-end">
        <button
          onClick={handleCopy}
          className={`flex items-center px-4 py-2 rounded-none border-2 border-black shadow-none text-sm font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-800'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {copied ? (
            <>
              <Check size={16} className="mr-2" />
              Copied {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </>
          ) : (
            <>
              <Copy size={16} className="mr-2" />
              Copy {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};