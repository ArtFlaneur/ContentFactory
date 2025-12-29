import React from 'react';
import { SharePayload } from '../types';
import { GeneratedPost } from './GeneratedPost';
import { ArrowLeft } from 'lucide-react';

interface SharePreviewProps {
  payload: SharePayload;
  onExit: () => void;
}

const STATUS_META = {
  draft: {
    label: 'Draft',
    badge: 'bg-slate-100 text-slate-800 border-slate-300'
  },
  needs_review: {
    label: 'Needs Review',
    badge: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  approved: {
    label: 'Approved',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-400'
  }
} as const;

export const SharePreview: React.FC<SharePreviewProps> = ({ payload, onExit }) => {
  const { post, request, metadata, sharedAt } = payload;
  const status = (metadata?.status || 'draft') as keyof typeof STATUS_META;
  const statusMeta = STATUS_META[status];
  const sharedStamp = React.useMemo(() => {
    try {
      return new Date(sharedAt).toLocaleString();
    } catch {
      return '';
    }
  }, [sharedAt]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <header className="bg-white border-b-2 border-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col justify-center">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Shared via ContentFactory</p>
          <div className="flex items-center justify-between mt-1 gap-4 flex-wrap">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{post?.title || 'Shared draft'}</h1>
              {sharedStamp && <p className="text-xs text-slate-500">Link generated {sharedStamp}</p>}
            </div>
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 px-3 py-2 border-2 border-black bg-amber-50 hover:bg-amber-100 text-sm font-semibold rounded-none transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Open app
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="bg-white border-2 border-black p-5 rounded-none">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 border ${statusMeta.badge}`}>
                {statusMeta.label}
              </span>
              {request?.goal && (
                <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 border border-indigo-200 bg-indigo-50 text-indigo-800">
                  Goal: {request.goal}
                </span>
              )}
              {request?.tone && (
                <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 border border-slate-200 bg-slate-50 text-slate-700">
                  Tone: {request.tone}
                </span>
              )}
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
              {request?.audience && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Audience</dt>
                  <dd className="font-medium">{request.audience}</dd>
                </div>
              )}
              {request?.category && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Category</dt>
                  <dd className="font-medium">{request.category}</dd>
                </div>
              )}
              {request?.language && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Language</dt>
                  <dd className="font-medium">{request.language}</dd>
                </div>
              )}
              {metadata?.note && (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Reviewer note</dt>
                  <dd className="font-medium whitespace-pre-line mt-1">{metadata.note}</dd>
                </div>
              )}
            </dl>
          </div>

          <GeneratedPost
            post={post}
            isLoading={false}
            statusText={null}
            onReset={() => {}}
            userSettings={null}
            variant="share"
          />
        </div>
      </main>
    </div>
  );
};

interface SharePreviewErrorProps {
  message: string;
  onExit: () => void;
}

export const SharePreviewError: React.FC<SharePreviewErrorProps> = ({ message, onExit }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border-2 border-black p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Link unavailable</h2>
        <p className="text-sm text-slate-600 mb-4">{message}</p>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center justify-center px-4 py-2 border-2 border-black bg-indigo-600 text-white text-sm font-semibold rounded-none hover:bg-indigo-700 transition-colors"
        >
          Open ContentFactory
        </button>
      </div>
    </div>
  );
};
