import React from 'react';
import { GeneratedPost as GeneratedPostType } from '../types';
import { Copy, Check, RefreshCw, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface GeneratedPostProps {
  post: GeneratedPostType | null;
  onReset: () => void;
}

export const GeneratedPost: React.FC<GeneratedPostProps> = ({ post, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  if (!post) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">✨</span>
        </div>
        <p className="font-medium">Ready to create content</p>
        <p className="text-sm mt-1 text-slate-400 max-w-xs text-center">Select your audience and topic to generate a structured LinkedIn post.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
        <div>
            <h3 className="font-semibold text-indigo-900">{post.title}</h3>
            <p className="text-xs text-indigo-500 mt-0.5">Tone: Professional, Raw, System-Oriented</p>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={onReset}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Create New"
            >
                <RefreshCw size={18} />
            </button>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto max-h-[600px] prose prose-slate prose-indigo max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>

        {/* Source Links Section */}
        {post.sourceLinks && post.sourceLinks.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Sources & References</h4>
            <div className="flex flex-wrap gap-2">
              {post.sourceLinks.map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors no-underline"
                >
                  <span className="truncate max-w-[150px]">{link.title}</span>
                  <ExternalLink size={10} className="ml-1.5 opacity-50" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button
          onClick={handleCopy}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            copied 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {copied ? (
            <>
              <Check size={16} className="mr-2" />
              Copied to Clipboard
            </>
          ) : (
            <>
              <Copy size={16} className="mr-2" />
              Copy Post
            </>
          )}
        </button>
      </div>
    </div>
  );
};