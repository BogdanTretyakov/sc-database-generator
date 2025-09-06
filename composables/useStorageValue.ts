export const useStorageValue = <T extends string = string>(
  storageKey: string,
  defaultValue?: T
) => {
  const value = useState<T>(storageKey, () => defaultValue ?? ('' as T));

  onNuxtReady(() => {
    value.value = (storage.get(storageKey) ?? defaultValue ?? '') as T;
  });

  watch(
    () => value.value,
    (value, oldValue) => {
      if (value === oldValue) return;
      if (!value) {
        return storage.remove(storageKey);
      }
      storage.set(storageKey, value);
    }
  );

  return value;
};
