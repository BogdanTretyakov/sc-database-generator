const storageAvailable = (() => {
  try {
    globalThis.localStorage.setItem('test', 'test');
    globalThis.localStorage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
})();

export const storage = {
  get(key: string) {
    if (!storageAvailable) return null;
    return localStorage.getItem(key);
  },
  set(key: string, value: string) {
    if (!storageAvailable) return;
    localStorage.setItem(key, value);
  },
  remove(key: string) {
    if (!storageAvailable) return;
    localStorage.removeItem(key);
  },
};
