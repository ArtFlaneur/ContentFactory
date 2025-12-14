export const getAppBaseUrl = (): string => {
  const raw =
    ((import.meta as any).env?.VITE_SITE_URL as string | undefined) ||
    ((import.meta as any).env?.VITE_PUBLIC_SITE_URL as string | undefined);

  if (raw && typeof raw === 'string') {
    return raw.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return '';
};
