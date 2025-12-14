type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const memory = new Map<string, string>();

const tryGetStorage = (kind: 'localStorage' | 'sessionStorage'): StorageLike | null => {
  if (typeof window === 'undefined') return null;

  try {
    const s = window[kind];
    if (!s) return null;

    // Probe write (some private modes throw/quota=0)
    const probeKey = '__cf_storage_probe__';
    s.setItem(probeKey, '1');
    s.removeItem(probeKey);

    return s;
  } catch {
    return null;
  }
};

const local = tryGetStorage('localStorage');
const session = tryGetStorage('sessionStorage');

const backend: StorageLike = local || session || {
  getItem: (key) => (memory.has(key) ? memory.get(key)! : null),
  setItem: (key, value) => {
    memory.set(key, value);
  },
  removeItem: (key) => {
    memory.delete(key);
  }
};

export const storage = {
  getItem(key: string): string | null {
    try {
      return backend.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      backend.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem(key: string) {
    try {
      backend.removeItem(key);
    } catch {
      // ignore
    }
  }
};

export const storageBackend = {
  kind: local ? 'localStorage' : session ? 'sessionStorage' : 'memory'
};
