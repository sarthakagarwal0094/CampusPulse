const STORAGE_SCHEMA_KEY = "campuspulse_schema_version";
const CURRENT_SCHEMA_VERSION = 1;

function storage() {
  try { return typeof window === "undefined" ? null : window.localStorage; }
  catch { return null; }
}

function ensureSchema(store) {
  try {
    const version = Number(store.getItem(STORAGE_SCHEMA_KEY) || 0);
    if (version < CURRENT_SCHEMA_VERSION) store.setItem(STORAGE_SCHEMA_KEY, String(CURRENT_SCHEMA_VERSION));
  } catch { /* Existing records remain usable if metadata cannot be written. */ }
}

export const localStorageRepository = {
  read(key, fallback, validate = () => true) {
    const store = storage();
    if (!store) return fallback;
    ensureSchema(store);
    try {
      const raw = store.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      return validate(parsed) ? parsed : fallback;
    } catch { return fallback; }
  },
  write(key, value) {
    const store = storage();
    if (!store) return false;
    ensureSchema(store);
    try { store.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key) {
    const store = storage();
    if (!store) return false;
    try { store.removeItem(key); return true; }
    catch { return false; }
  },
  clear(keys, prefixes = []) {
    const store = storage();
    if (!store) return false;
    try {
      keys.forEach((key) => store.removeItem(key));
      const prefixedKeys = [];
      for (let index = 0; index < store.length; index += 1) {
        const key = store.key(index);
        if (key && prefixes.some((prefix) => key.startsWith(prefix))) prefixedKeys.push(key);
      }
      prefixedKeys.forEach((key) => store.removeItem(key));
      return true;
    }
    catch { return false; }
  },
};
