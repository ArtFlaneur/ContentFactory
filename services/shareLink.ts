import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { GeneratedPost, HistoryMetadata, HistoryRequestSnapshot, SharePayload } from '../types';

const SHARE_PAYLOAD_VERSION = 1;

const sanitizeMetadata = (metadata?: HistoryMetadata | null): HistoryMetadata | undefined => {
  if (!metadata) return undefined;
  return {
    status: metadata.status,
    note: metadata.note?.trim() || undefined
  };
};

export const createSharePayload = (
  post: GeneratedPost,
  options: {
    request?: HistoryRequestSnapshot | null;
    metadata?: HistoryMetadata | null;
  } = {}
): SharePayload => {
  return {
    version: SHARE_PAYLOAD_VERSION,
    sharedAt: Date.now(),
    post,
    request: options.request || undefined,
    metadata: sanitizeMetadata(options.metadata)
  };
};

export const encodeSharePayload = (payload: SharePayload): string => {
  return compressToEncodedURIComponent(JSON.stringify(payload));
};

export const decodeSharePayload = (token: string): SharePayload | null => {
  try {
    const json = decompressFromEncodedURIComponent(token);
    if (!json) return null;
    const parsed = JSON.parse(json) as SharePayload;
    if (!parsed?.post || typeof parsed.version !== 'number') {
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to decode share payload', err);
    return null;
  }
};

export const buildShareUrl = (payload: SharePayload): string => {
  if (typeof window === 'undefined') return '';
  const basePath = `${window.location.origin}${window.location.pathname}`;
  const encoded = encodeSharePayload(payload);
  return `${basePath}?share=${encoded}`;
};
