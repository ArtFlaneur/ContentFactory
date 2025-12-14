import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import type { Category, HistoryItem } from '../types';

interface HistoryPanelProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const formatDateTime = (ms: number) => {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return '';
  }
};

const categoryLabel = (category: Category) => String(category);

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ items, onSelect }) => {
  if (!items || items.length === 0) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-black rounded-none bg-slate-50">
        <div className="w-16 h-16 bg-white border-2 border-black rounded-none flex items-center justify-center mb-4">
          <Clock className="h-7 w-7" />
        </div>
        <p className="font-medium">No history yet</p>
        <p className="text-sm mt-1 text-slate-400 max-w-xs text-center">
          Generate a post and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-none shadow-none border-2 border-black overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b-2 border-black bg-slate-50">
        <h3 className="font-semibold text-slate-900">History</h3>
        <p className="text-xs text-slate-500 mt-0.5">Click an item to reopen the generated text.</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left p-4 rounded-none border-2 border-black hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{item.post.title || item.request.topic}</p>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {categoryLabel(item.request.category)} · {item.request.audience}
                  {item.request.includeNews ? ' · news' : ''}
                </p>
                <p className="text-xs text-slate-400 mt-1">{formatDateTime(item.createdAt)}</p>
              </div>
              <div className="flex items-center text-indigo-600 text-sm font-medium flex-shrink-0">
                Open <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3 overflow-hidden max-h-10">
              {item.post.content?.slice(0, 180) || ''}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
