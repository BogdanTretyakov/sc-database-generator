import identity from 'lodash/identity';

export const useStorageValue = <T extends string = string, K = T>(
  storageKey: string,
  defaultValue?: T | K,
  formatter?: (value: T | K) => K
) => {
  const value = useState<K>(
    storageKey,
    // @ts-expect-error don't wanna type it
    () => (formatter ?? identity)(defaultValue) ?? ('' as K)
  );

  onNuxtReady(() => {
    const val = (storage.get(storageKey) ?? defaultValue ?? '') as K;
    value.value = formatter ? formatter(val) : val;
  });

  watch(
    () => value.value,
    (value, oldValue) => {
      if (value === oldValue) return;
      if (!value) {
        return storage.remove(storageKey);
      }
      storage.set(storageKey, String(value));
    }
  );

  return value;
};
