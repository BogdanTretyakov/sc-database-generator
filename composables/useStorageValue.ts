import identity from 'lodash/identity';

export const useStorageValue = <T extends string|number = string, K = T>(
  storageKey: MaybeRef<string>,
  defaultValue?: T | K,
  formatter?: (value: T | K) => K,
) => {
  const value = useState<K>(
    toValue(storageKey),
    // @ts-expect-error don't wanna type it
    () => (formatter ?? identity)(defaultValue) ?? ('' as K),
  );

  onNuxtReady(() => {
    const val = (storage.get(toValue(storageKey)) ?? defaultValue ?? '') as K;
    value.value = formatter ? formatter(val) : val;
  });

  watch(
    () => value.value,
    (value, oldValue) => {
      if (value === oldValue) return;
      if (!value) {
        return storage.remove(toValue(storageKey));
      }
      storage.set(toValue(storageKey), String(value));
    },
  );

  watch(
    () => toValue(storageKey),
    (newKey, oldKey) => {
      if (newKey === oldKey) return;
      const val = (storage.get(newKey) ?? defaultValue ?? '') as K;
      value.value = formatter ? formatter(val) : val;
    },
  );

  return value;
};
